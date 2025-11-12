import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import ReactMarkdown from 'react-markdown';
import styles from './dynamic-docs.module.css';
import { useLocation } from '@docusaurus/router';



// API配置
const API_BASE_URL = 'http://localhost:3001/api';

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
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const location = useLocation();
useEffect(() => {
  // 从 URL 中解析 docId
  const docId = decodeURIComponent(location.pathname.replace(/^\/dynamic-docs\//, ''));
  console.dir(`ddddddd=${docId}`)
  
  // 如果 docId 有变化且不为空，则加载文档
  if (docId && docId !== currentDocId) {
    loadDocument(docId);
  }
}, [location.pathname]);

  // 获取文档目录结构
  useEffect(() => {
    fetchStructure();
  }, []);

  const fetchStructure = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/docs/structure`);
      const data = await response.json();
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
      const response = await fetch(`${API_BASE_URL}/docs/content/${docId}`);
      const data = await response.json();

      if (data.success) {
        setCurrentDoc(data.data);
        setCurrentDocId(docId);

        if (updateHistory) {
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push(docId);
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        }
      } else {
        setError('无法加载文档内容');
      }
    } catch (err) {
      setError('加载文档失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 前进后退
  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      loadDocument(history[newIndex], false);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      loadDocument(history[newIndex], false);
    }
  };

  // 渲染侧边栏项目
  const renderSidebarItem = (item: DocItem, level = 0) => {
    if (item.type === 'category') {
      return (
        <div key={item.path} className={styles.category} style={{ paddingLeft: `${level * 16}px` }}>
          <div className={styles.categoryLabel}>{item.label}</div>
          {item.items?.map(child => renderSidebarItem(child, level + 1))}
        </div>
      );
    } else {
      return (
        <div
          key={item.id}
          className={`${styles.docItem} ${currentDocId === item.id ? styles.active : ''}`}
          style={{ paddingLeft: `${level * 16}px` }}
          onClick={() => loadDocument(item.id)}
        >
          {item.label}
        </div>
      );
    }
  };

  return (
    <Layout title="动态文档" description="动态加载的文档页面">
      <div className={styles.container}>
        {/* 侧边栏 */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>文档目录</div>
          {structure.map(item => renderSidebarItem(item))}
        </aside>

        {/* 主内容区 */}
        <main className={styles.mainContent}>
          {/* 导航栏 */}
          <div className={styles.navigation}>
            <button
              onClick={goBack}
              disabled={historyIndex <= 0}
              className={styles.navButton}
            >
              ← 后退
            </button>
            <button
              onClick={goForward}
              disabled={historyIndex >= history.length - 1}
              className={styles.navButton}
            >
              前进 →
            </button>
            <span className={styles.navInfo}>
              {historyIndex + 1} / {history.length}
            </span>
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
