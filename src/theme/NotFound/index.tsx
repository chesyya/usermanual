import React, { type ReactNode, useState, useEffect } from 'react';
import NotFound from '@theme-original/NotFound';
import type NotFoundType from '@theme/NotFound';
import type { WrapperProps } from '@docusaurus/types';
import { useLocation } from '@docusaurus/router';
import Layout from '@theme/Layout';
import DocSidebar from '@theme/DocSidebar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = WrapperProps<typeof NotFoundType>;

const API_BASE_URL = 'http://localhost:5556/usermanual/plugins';

interface DocContent {
  title: string;
  content: string;
}

export default function NotFoundWrapper(props: Props): ReactNode {
  const location = useLocation();
  const [dynamicContent, setDynamicContent] = useState<DocContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  // 检查是否是动态文档路由（使用 /dynamic-docs/ 前缀）
  const isDynamicDocPath = location.pathname.startsWith('/dynamic-docs/');

  console.log('[NotFound] pathname:', location.pathname, 'isDynamicDocPath:', isDynamicDocPath);

  useEffect(() => {
    if (!isDynamicDocPath) {
      setIsNotFound(true);
      setLoading(false);
      return;
    }

    // 尝试获取动态内容
    // location.pathname 已经是解码后的
    const docId = location.pathname.replace(/^\/dynamic-docs\//, '').replace(/\/$/, '');

    // 对路径的每一段进行编码，但保留 /
    const encodedDocId = docId.split('/').map(segment => encodeURIComponent(segment)).join('/');

    console.log('[NotFound] Fetching:', `${API_BASE_URL}/docs/content/${encodedDocId}`);

    fetch(`${API_BASE_URL}/docs/content/${encodedDocId}`)
      .then(res => res.json())
      .then(data => {
        console.dir(`data: ${JSON.stringify(data.content)}`);
        if (data.success && data.content) {
          setDynamicContent(data.content);
          setIsNotFound(false);
        } else {
          setIsNotFound(true);
        }
      })
      .catch(err => {
        console.error('Failed to load dynamic content:', err);
        setIsNotFound(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [location.pathname, isDynamicDocPath]);

  // 如果正在加载
  if (loading) {
    return (
      <Layout>
        <div className="container margin-vert--xl">
          <div className="row">
            <div className="col">
              <div className="theme-doc-markdown markdown">
                Loading...
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // 如果找到了动态内容，渲染完整的文档布局
  if (!isNotFound && dynamicContent) {
    return (
      <Layout>
        <div className="container margin-vert--lg">
          <div className="row">
            <main className="col col--8 col--offset-2">
              <article>
                <div className="theme-doc-markdown markdown">
                  <header>
                    <h1 className="margin-bottom--lg">{dynamicContent.title}</h1>
                  </header>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {dynamicContent.content}
                  </ReactMarkdown>
                </div>
              </article>
            </main>
          </div>
        </div>
      </Layout>
    );
  }

  // 否则显示404页面
  return <NotFound {...props} />;
}
