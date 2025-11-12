const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001/api';

module.exports = function (context, options) {
  return {
    name: 'dynamic-docs-plugin',

    async loadContent() {
      try {
        // 从API获取文档结构
        const structureRes = await fetch(`${API_BASE_URL}/docs/structure`);
        const structureData = await structureRes.json();

        if (!structureData.success) {
          console.warn('Failed to fetch docs structure from API');
          return null;
        }

        // 获取所有文档内容
        const docs = [];
        const structure = structureData.data;

        async function fetchDocs(items) {
          for (const item of items) {
            if (item.type === 'doc') {
              try {
                const contentRes = await fetch(`${API_BASE_URL}/docs/content/${item.id}`);
                const contentData = await contentRes.json();

                if (contentData.success) {
                  docs.push({
                    id: item.id,
                    ...contentData.data
                  });
                }
              } catch (err) {
                console.error(`Failed to fetch doc ${item.id}:`, err);
              }
            } else if (item.items) {
              await fetchDocs(item.items);
            }
          }
        }

        await fetchDocs(structure);

        return {
          structure,
          docs
        };
      } catch (error) {
        console.error('Dynamic docs plugin error:', error);
        return null;
      }
    },

    async contentLoaded({ content, actions }) {
      if (!content) return;

      const { createData, addRoute } = actions;

      // 为每个文档创建路由
      for (const doc of content.docs) {
        const docData = await createData(
          `dynamic-doc-${doc.id}.json`,
          JSON.stringify(doc)
        );

        addRoute({
          path: `/docs/${doc.id}`,
          component: '@site/src/components/DynamicDoc.tsx',
          exact: true,
          modules: {
            content: docData,
          },
        });
      }

      // 创建侧边栏数据
      const sidebarData = await createData(
        'dynamic-sidebar.json',
        JSON.stringify(content.structure)
      );
    },
  };
};
