# 🚀 快速启动指南

## 现在已经实现的功能

✅ **覆盖了原有的 `/docs` 路由**
✅ **侧边栏动态从API加载**
✅ **文档内容动态渲染**
✅ **修改Markdown后刷新即可看到效果**

---

## 第一步：启动系统

### 选项A：使用启动脚本（推荐）

```bash
chmod +x start-dynamic.sh
./start-dynamic.sh
```

### 选项B：手动启动

**终端1 - API服务器:**
```bash
cd api-server
node server.js
```

**终端2 - Docusaurus开发服务器:**
```bash
yarn start
```

---

## 第二步：访问页面

启动成功后，打开浏览器访问：

- **主页**: http://localhost:3000
- **文档**: http://localhost:3000/docs/intro ⭐ **这个页面现在是动态的！**
- **动态文档专用页**: http://localhost:3000/dynamic-docs

---

## 第三步：测试动态更新

1. **编辑一个文档**:
   ```bash
   echo "

   ## 🎉 这是动态添加的内容！

   当前时间: $(date)
   " >> docs/intro.md
   ```

2. **刷新浏览器** (不需要重新构建！)
   - 访问: http://localhost:3000/docs/intro
   - 你会看到新内容立即显示

3. **查看侧边栏**:
   - 侧边栏标题显示 "📚 文档目录（动态）"
   - 所有菜单项都是从API动态加载的

---

## 验证是否在使用动态渲染

### 方法1：检查侧边栏标题
如果你看到 **"📚 文档目录（动态）"**，说明正在使用动态渲染！

### 方法2：查看浏览器控制台
打开开发者工具，检查网络请求：
- 应该能看到对 `http://localhost:3001/api/docs/structure` 的请求
- 应该能看到对 `http://localhost:3001/api/docs/content/intro` 的请求

### 方法3：测试实时更新
1. 编辑 `docs/intro.md`
2. 只刷新浏览器（不运行 `yarn build`）
3. 如果看到新内容 = 动态渲染成功！✅

---

## 工作原理

```
用户访问 /docs/intro
    ↓
Docusaurus加载自定义 DocPage 组件
(src/theme/DocPage/index.tsx)
    ↓
组件调用API获取数据
    ↓
GET http://localhost:3001/api/docs/structure  (侧边栏)
GET http://localhost:3001/api/docs/content/intro  (内容)
    ↓
API服务器读取 docs/ 目录
    ↓
返回Markdown内容
    ↓
React组件动态渲染为HTML
    ↓
用户看到页面
```

---

## 常见问题

### Q1: 访问 /docs/intro 还是看到旧的静态内容？

**解决方法**:
1. 确保API服务器在运行:
   ```bash
   curl http://localhost:3001/api/docs/structure
   ```
2. **重启Docusaurus开发服务器** (Ctrl+C 然后重新运行 `yarn start`)
3. 清除浏览器缓存 (Ctrl+Shift+R 强制刷新)

### Q2: 看到CORS错误？

**解决方法**: API服务器已配置CORS，确保它在 http://localhost:3001 运行

### Q3: 侧边栏没有显示 "（动态）" 标记？

**原因**: 说明Docusaurus还在使用默认组件，没有加载自定义的 DocPage 组件

**解决方法**:
1. 检查文件是否存在: `ls src/theme/DocPage/index.tsx`
2. 重启Docusaurus: 按 Ctrl+C 停止，然后重新 `yarn start`

### Q4: 组件报错？

查看终端输出的错误信息，可能需要：
```bash
yarn install  # 重新安装依赖
```

---

## 项目结构

```
my-website/
├── api-server/                      # API后端
│   ├── server.js                   # Express服务器
│   └── package.json
│
├── src/
│   └── theme/
│       └── DocPage/                # 🎯 覆盖默认文档页面
│           ├── index.tsx           # 动态文档组件
│           └── styles.module.css   # 样式
│
├── docs/                           # Markdown源文件
│   ├── intro.md
│   ├── tutorial-basics/
│   └── tutorial-extras/
│
└── start-dynamic.sh                # 启动脚本
```

---

## 下一步

1. ✅ **已完成**: 覆盖 `/docs` 路由
2. ✅ **已完成**: 动态侧边栏
3. ✅ **已完成**: 动态内容渲染
4. 🎯 **可选**: 添加搜索功能
5. 🎯 **可选**: 添加前进/后退按钮
6. 🎯 **可选**: 添加编辑按钮

---

## 关键文件说明

### 1. src/theme/DocPage/index.tsx
这是**最关键**的文件！它覆盖了Docusaurus的默认文档页面组件。

**关键功能**:
- 从API获取侧边栏结构
- 根据URL路径加载对应文档
- 渲染Markdown内容

### 2. api-server/server.js
提供3个API接口：
- `GET /api/docs/structure` - 文档目录树
- `GET /api/docs/content/:docId` - 文档内容
- `GET /api/docs/search` - 搜索功能

### 3. src/pages/dynamic-docs.tsx
这是一个**额外的**完整示例页面，展示了更多功能（如前进/后退）。

---

## 成功标志

当你看到以下内容时，说明一切正常：

✅ 侧边栏标题: **"📚 文档目录（动态）"**
✅ 浏览器控制台有对 `localhost:3001` 的请求
✅ 编辑Markdown文件后刷新即可看到更新
✅ 不需要运行 `yarn build`

---

## 需要帮助？

- 查看API日志: `tail -f /tmp/api-server.log`
- 测试API: `curl http://localhost:3001/api/docs/structure`
- 查看详细文档: `cat README-DYNAMIC.md`

祝使用愉快！🎉
