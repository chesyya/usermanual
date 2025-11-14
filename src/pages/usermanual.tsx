import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import ReactMarkdown from 'react-markdown';
import styles from './dynamic-docs.module.css';
import { useLocation, useHistory } from '@docusaurus/router';



// API配置
const API_BASE_URL = 'http://localhost:5556/usermanual/plugins/';
const BACK_URL = '/docs/intro';

interface DocItem {
  type: 'doc' | 'category';
  id?: string;
  label: string;
  path: string;
  items?: DocItem[];
}

interface DocContent {
  title: string;
  description: string;
  content: string;
  frontMatter: any;
}

export default function DynamicDocs() {
  const [structure, setStructure] = useState<DocItem[]>([]);
  const [currentDoc, setCurrentDoc] = useState<DocContent | null>(null);
  const [currentDocId, setCurrentDocId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const location = useLocation();
  const history = useHistory();
useEffect(() => {
  // 从 URL 中解析 docId
  const docId = decodeURIComponent(location.pathname.replace(/^\/usermanual\/plugins\//, ''));
  console.dir(`ddddddd=${docId}`)
  
  // 如果 docId 有变化且不为空，则加载文档
  if (docId && docId !== currentDocId) {
    loadDocument(docId);
  }
}, [location.pathname]);

  // // 获取文档目录结构
  // useEffect(() => {
  //   fetchStructure();
  // }, []);

  const fetchStructure = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}structure`);
      const data = await response.json();
      console.dir(`1111111111=${JSON.stringify(data)}`);
      if (data.success) {
        setStructure(data.data);
        // 自动加载第一个文档
        const firstDoc = findFirstDoc(data.data);
        if (firstDoc) {
          loadDocument(firstDoc.id);
        }
      }
    } catch (err) {
      setError('无法加载文档结构: ' + err.message);
    }
  };

  // 查找第一个文档
  const findFirstDoc = (items: DocItem[]): DocItem | null => {
    for (const item of items) {
      if (item.type === 'doc') {
        return item;
      } else if (item.items && item.items.length > 0) {
        const doc = findFirstDoc(item.items);
        if (doc) return doc;
      }
    }
    return null;
  };

  // 加载文档内容
  const loadDocument = async (docId: string, updateHistory = true) => {
    setLoading(true);
    setError('');
    try {
      console.dir(`cccccc=${docId}`);
      const response = await fetch(`${API_BASE_URL}${docId}`);
      const data = await response.json();
      console.log('加载文档内容:', data);

      if (data.success && data.content) {
      // 1. 构建符合 DocContent 接口的对象
      const docData: DocContent = {
      title: data.title || '文档标题',
      description: data.description || '',
      content: data.content,
      frontMatter: data.frontMatter || {},
      };

      setCurrentDoc(docData); // 2. 设置对象到状态
      setCurrentDocId(docId);

    // ... 历史记录逻辑
    } else {
    setError('无法加载文档内容');
    }
    } catch (err) {
      setError('加载文档失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 渲染侧边栏项目
  // const renderSidebarItem = (item: DocItem, level = 0) => {
  //   console.dir(`Rendering sidebar item:${JSON.stringify(item)}`);
  //   if (item.type === 'category') {
  //     return (
  //       <div key={item.path} className={styles.category} style={{ paddingLeft: `${level * 16}px` }}>
  //         <div className={styles.categoryLabel}>{item.label}</div>
  //         {item.items?.map(child => renderSidebarItem(child, level + 1))}
  //       </div>
  //     );
  //   } else {
  //     return (
  //       <div
  //         key={item.id}
  //         className={`${styles.docItem} ${currentDocId === item.id ? styles.active : ''}`}
  //         style={{ paddingLeft: `${level * 16}px` }}
  //         onClick={() => loadDocument(item.id)}
  //       >
  //         {item.label}
  //       </div>
  //     );
  //   }
  // };

  const handleBackClick = () => {
    // 使用 navigate 跳转到预定的 URL
    history.push(BACK_URL);
  };

  return (
    <Layout title="动态文档" description="动态加载的文档页面">
      <div className={styles.container}>

        {/* 主内容区 */}
        <main className={styles.mainContent}>
          {/* 导航栏 */}
          <div className={styles.navigation}>
            <button
              onClick={handleBackClick}
              className={styles.navButton}
            >
              ← 返回文档首页
            </button>
          </div>

          {/* 内容显示区 */}
          <div className={styles.content}>
            {loading && <div className={styles.loading}>加载中...</div>}
            {error && <div className={styles.error}>{error}</div>}
            {currentDoc && !loading && (
              <>
                <h1>{currentDoc.title}</h1>
                {currentDoc.description && (
                  <p className={styles.description}>{currentDoc.description}</p>
                )}
                <div className={styles.markdown}>
                  <ReactMarkdown>{currentDoc.content}</ReactMarkdown>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </Layout>
  );
}
