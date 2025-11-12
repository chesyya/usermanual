import React, { type ReactNode, useState, useEffect } from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';
import { useLocation } from '@docusaurus/router';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = WrapperProps<typeof ContentType>;

const API_BASE_URL = 'http://localhost:3001/api';

export default function ContentWrapper(props: Props): ReactNode {
  const location = useLocation();
  const [dynamicContent, setDynamicContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 检查是否是动态文档路由（排除placeholder）
  const isDynamicDoc = location.pathname.startsWith('/docs/') &&
                       location.pathname !== '/docs' &&
                       !location.pathname.includes('/placeholder');

  useEffect(() => {
    if (isDynamicDoc) {
      loadDynamicContent();
    }
  }, [location.pathname, isDynamicDoc]);

  const loadDynamicContent = async () => {
    setLoading(true);
    try {
      const docId = location.pathname.replace(/^\/docs\//, '').replace(/\/$/, '');
      const response = await fetch(`${API_BASE_URL}/docs/content/${docId}`);
      const data = await response.json();

      if (data.success) {
        setDynamicContent(data.data.content);
      }
    } catch (error) {
      console.error('Failed to load dynamic content:', error);
    } finally {
      setLoading(false);
    }
  };

  // 如果是动态文档且已加载内容，使用自定义渲染
  if (isDynamicDoc && dynamicContent) {
    return (
      <div className="theme-doc-markdown markdown">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {dynamicContent}
        </ReactMarkdown>
      </div>
    );
  }

  // 如果正在加载
  if (isDynamicDoc && loading) {
    return <div className="theme-doc-markdown markdown">Loading...</div>;
  }

  // 否则使用原始组件（保持100%原生样式）
  return <Content {...props} />;
}
