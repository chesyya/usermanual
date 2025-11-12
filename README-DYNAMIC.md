# 动态文档系统使用说明

## 项目结构

```
my-website/
├── api-server/           # API服务器
│   ├── server.js        # Express服务器
│   └── package.json     # 服务器依赖
├── src/pages/           # Docusaurus页面
│   ├── dynamic-docs.tsx # 动态文档页面
│   └── dynamic-docs.module.css # 样式
├── docs/                # Markdown文档源文件
└── start-all.sh         # 一键启动脚本
```

## 工作原理

1. **API服务器** (端口3001)
   - 读取 `docs/` 目录下的Markdown文件
   - 提供REST API接口：
     - `GET /api/docs/structure` - 获取文档目录结构
     - `GET /api/docs/content/:docId` - 获取单个文档内容
     - `GET /api/docs/search?q=keyword` - 搜索文档

2. **前端页面** (http://localhost:3000/dynamic-docs)
   - 侧边栏：动态显示文档目录树
   - 主体区域：动态渲染Markdown内容
   - 导航：前进/后退功能

## 快速开始

### 方法1：一键启动（推荐）

```bash
chmod +x start-all.sh
./start-all.sh
```

### 方法2：分别启动

**终端1 - 启动API服务器：**
```bash
cd api-server
npm start
```

**终端2 - 启动Docusaurus开发服务器：**
```bash
yarn start
```

### 访问页面

打开浏览器访问：http://localhost:3000/dynamic-docs

## 功能特性

### ✅ 已实现功能

1. **动态目录结构**
   - 自动扫描 `docs/` 目录
   - 支持多级分类
   - 实时加载文档列表

2. **动态内容渲染**
   - 从API获取Markdown内容
   - 实时渲染为HTML
   - 支持frontmatter元数据

3. **导航功能**
   - 点击侧边栏切换文档
   - 前进/后退按钮
   - 历史记录追踪

4. **响应式设计**
   - 支持暗色/亮色主题
   - 适配移动端

### 🔧 API接口详情

#### 1. 获取文档结构
```http
GET http://localhost:3001/api/docs/structure

Response:
{
  "success": true,
  "data": [
    {
      "type": "doc",
      "id": "intro",
      "label": "Introduction",
      "path": "intro.md"
    },
    {
      "type": "category",
      "label": "Tutorial Basics",
      "path": "tutorial-basics",
      "items": [...]
    }
  ]
}
```

#### 2. 获取文档内容
```http
GET http://localhost:3001/api/docs/content/intro

Response:
{
  "success": true,
  "data": {
    "title": "Tutorial Intro",
    "description": "...",
    "frontMatter": { ... },
    "content": "# Markdown content here..."
  }
}
```

#### 3. 搜索文档
```http
GET http://localhost:3001/api/docs/search?q=tutorial

Response:
{
  "success": true,
  "data": [
    {
      "id": "intro",
      "title": "Tutorial Intro",
      "excerpt": "..."
    }
  ]
}
```

## 修改文档

1. 编辑 `docs/` 目录下的Markdown文件
2. 刷新浏览器页面即可看到更新（无需重新构建！）

## 添加新文档

1. 在 `docs/` 目录下创建新的 `.md` 或 `.mdx` 文件
2. 添加frontmatter（可选）：
   ```markdown
   ---
   title: 我的新文档
   description: 文档描述
   ---

   # 文档内容
   ```
3. 刷新页面，新文档会自动出现在侧边栏

## 自定义配置

### 修改API服务器端口

编辑 `api-server/server.js`:
```javascript
const PORT = 3001; // 改为你想要的端口
```

同时修改 `src/pages/dynamic-docs.tsx`:
```typescript
const API_BASE_URL = 'http://localhost:3001/api'; // 对应修改
```

### 修改样式

编辑 `src/pages/dynamic-docs.module.css` 自定义样式。

## 生产部署

### 选项1：静态导出（保留动态功能）

```bash
# 构建前端
yarn build

# 单独运行API服务器
cd api-server
npm start

# 使用nginx或其他服务器托管 build/ 目录
# 确保API服务器可访问
```

### 选项2：使用Node.js服务器同时提供前端和API

创建一个统一的服务器：
```javascript
const express = require('express');
const app = express();

// 提供API
app.use('/api', require('./api-server/server'));

// 提供静态文件
app.use(express.static('build'));

app.listen(3000);
```

## 故障排除

### 问题1：CORS错误
确保API服务器已启用CORS（已在代码中配置）。

### 问题2：找不到文档
检查 `api-server/server.js` 中的 `DOCS_DIR` 路径是否正确。

### 问题3：样式不显示
确保Docusaurus开发服务器正在运行。

## 技术栈

- **前端**: React 19 + TypeScript + Docusaurus 3.9.2
- **后端**: Node.js + Express.js
- **Markdown解析**: gray-matter + react-markdown
- **样式**: CSS Modules

## 优势

✅ **实时更新** - 修改文档立即生效，无需重新构建
✅ **灵活** - 可以从任何来源（文件系统、数据库、API）获取内容
✅ **可扩展** - 易于添加搜索、评论、权限控制等功能
✅ **SEO友好** - 可以配合服务端渲染(SSR)

## 下一步建议

1. **添加搜索功能** - 利用已有的搜索API接口
2. **添加代码高亮** - 使用 `react-syntax-highlighter`
3. **添加目录(TOC)** - 自动生成文档内页目录
4. **添加编辑功能** - 允许在线编辑Markdown
5. **添加权限控制** - 根据用户角色显示不同文档
