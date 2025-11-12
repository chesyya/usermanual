# 使用指南

## 🎯 你现在拥有了什么？

一个**动态渲染文档系统**，包含：

1. ✅ **API服务器** - 提供文档数据（已启动在后台）
2. ✅ **React前端页面** - 动态显示内容
3. ✅ **完整的前后端分离架构**

## 🚀 快速启动

### 方式1：查看已启动的API服务器

API服务器已经在后台运行（端口3001）。你可以测试API：

```bash
# 测试文档结构API
curl http://localhost:3001/api/docs/structure

# 测试获取单个文档
curl http://localhost:3001/api/docs/content/intro
```

### 方式2：启动完整系统（推荐）

如果你想启动前端和后端，可以：

**终端1 - API服务器已在运行**
```bash
# 无需操作，已在后台运行
```

**终端2 - 启动Docusaurus开发服务器**
```bash
yarn start
```

然后访问：http://localhost:3000/dynamic-docs

## 📁 项目结构

```
my-website/
├── api-server/                    # 后端API服务器
│   ├── server.js                  # Express服务器
│   └── package.json
│
├── src/pages/                     # 前端页面
│   ├── dynamic-docs.tsx          # 动态文档主页面
│   └── dynamic-docs.module.css   # 样式文件
│
├── docs/                          # 文档源文件（Markdown）
│   ├── intro.md
│   ├── tutorial-basics/
│   └── tutorial-extras/
│
└── start-all.sh                   # 一键启动脚本
```

## 🔧 工作流程

### 传统Docusaurus（之前的问题）
```
编辑 docs/*.md  →  运行 yarn build  →  生成静态HTML  →  查看结果
         ↑____________需要重新构建____________↑
```

### 新的动态系统（已解决）
```
编辑 docs/*.md  →  API自动读取  →  前端动态渲染  →  立即看到结果
                     ↑_________实时生效_________↑
```

## 📊 三个关键区域的实现

### 1️⃣ 左侧目录区域
**实现位置**: `src/pages/dynamic-docs.tsx:127-148`

```typescript
// 从API获取目录结构
const fetchStructure = async () => {
  const response = await fetch(`${API_BASE_URL}/docs/structure`);
  const data = await response.json();
  setStructure(data.data);
}

// 渲染侧边栏
{structure.map(item => renderSidebarItem(item))}
```

**数据来源**: API服务器读取 `docs/` 目录结构

### 2️⃣ 中间内容区域
**实现位置**: `src/pages/dynamic-docs.tsx:74-95`

```typescript
// 点击目录项时动态加载文档
const loadDocument = async (docId: string) => {
  const response = await fetch(`${API_BASE_URL}/docs/content/${docId}`);
  const data = await response.json();
  setCurrentDoc(data.data);
}

// 渲染Markdown内容
<ReactMarkdown>{currentDoc.content}</ReactMarkdown>
```

**数据来源**: 从API获取Markdown内容，前端实时渲染

### 3️⃣ 前进/后退导航
**实现位置**: `src/pages/dynamic-docs.tsx:97-117`

```typescript
// 维护历史记录
const [history, setHistory] = useState<string[]>([]);
const [historyIndex, setHistoryIndex] = useState<number>(-1);

// 后退
const goBack = () => {
  if (historyIndex > 0) {
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    loadDocument(history[newIndex], false);
  }
}

// 前进
const goForward = () => {
  if (historyIndex < history.length - 1) {
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    loadDocument(history[newIndex], false);
  }
}
```

## 🎨 修改文档测试

试试修改一个文档，看看实时效果：

```bash
# 编辑一个文档
echo "# 这是动态更新的内容！" >> docs/intro.md

# 刷新API，立即获取新内容
curl http://localhost:3001/api/docs/content/intro
```

前端页面刷新后会立即显示新内容！

## 🔄 API接口说明

### 接口1：获取文档目录结构
```http
GET http://localhost:3001/api/docs/structure

返回数据格式：
{
  "success": true,
  "data": [
    {
      "type": "category",
      "label": "Tutorial Basics",
      "path": "tutorial-basics",
      "items": [
        {
          "type": "doc",
          "id": "tutorial-basics/intro",
          "label": "Introduction",
          "path": "tutorial-basics/intro.md"
        }
      ]
    }
  ]
}
```

### 接口2：获取文档内容
```http
GET http://localhost:3001/api/docs/content/{docId}

示例：
GET http://localhost:3001/api/docs/content/intro

返回数据：
{
  "success": true,
  "data": {
    "title": "Tutorial Intro",
    "description": "...",
    "frontMatter": { "sidebar_position": 1 },
    "content": "# Tutorial Intro\n\n..."
  }
}
```

### 接口3：搜索文档
```http
GET http://localhost:3001/api/docs/search?q={keyword}

示例：
GET http://localhost:3001/api/docs/search?q=tutorial
```

## 🛠️ 自定义开发

### 添加新的API功能

编辑 `api-server/server.js`，添加新的路由：

```javascript
// 示例：添加获取文档标签的API
app.get('/api/docs/tags', (req, res) => {
  // 你的逻辑
  res.json({ success: true, data: tags });
});
```

### 修改前端样式

编辑 `src/pages/dynamic-docs.module.css`：

```css
.sidebar {
  width: 300px;  /* 修改侧边栏宽度 */
  background-color: #f5f5f5;  /* 修改背景色 */
}
```

### 添加更多功能

一些建议：
- 📝 添加在线编辑Markdown功能
- 🔍 实现全文搜索UI
- 💬 添加评论系统
- 🔐 添加权限控制
- 📱 优化移动端体验

## 🐛 故障排除

### 问题：CORS错误
**解决**：API服务器已配置CORS，确保它在运行

### 问题：无法连接到API
**解决**：
```bash
# 检查API服务器是否运行
curl http://localhost:3001/api/docs/structure

# 如果没有响应，重启API服务器
cd api-server && npm start
```

### 问题：React页面报错
**解决**：
```bash
# 检查依赖是否安装
yarn install

# 重启开发服务器
yarn start
```

## 📚 更多信息

- API服务器代码：`api-server/server.js`
- 前端页面代码：`src/pages/dynamic-docs.tsx`
- 详细说明：`README-DYNAMIC.md`

## ✨ 优势总结

✅ **实时更新** - 修改Markdown文件后刷新即可看到效果
✅ **前后端分离** - API可以替换为任何数据源（数据库、CMS等）
✅ **灵活扩展** - 可以轻松添加搜索、编辑、权限等功能
✅ **开发友好** - 无需每次都运行 `yarn build`

现在你可以愉快地开发了！🎉
