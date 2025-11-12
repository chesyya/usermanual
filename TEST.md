# 🧪 测试动态渲染功能

## API服务器状态

API服务器当前运行在后台（PID可能不同）：

```bash
# 检查API服务器是否运行
curl http://localhost:3001/api/docs/structure

# 如果没有响应，启动API服务器
cd /root/my-website/api-server && node server.js &
```

---

## 测试步骤

### 1️⃣ 启动Docusaurus开发服务器

在项目根目录运行：
```bash
yarn start
```

等待启动完成，你会看到：
```
[SUCCESS] Docusaurus website is running at: http://localhost:3000/
```

---

### 2️⃣ 访问文档页面

打开浏览器访问: **http://localhost:3000/docs/intro**

**期望结果**:
- ✅ 侧边栏顶部显示 **"📚 文档目录（动态）"**
- ✅ 左侧显示动态加载的目录结构
- ✅ 右侧显示文档内容

---

### 3️⃣ 验证动态加载

打开浏览器开发者工具（F12），切换到 Network 标签页，然后：

1. 刷新页面
2. 查看网络请求

**期望看到的请求**:
```
GET http://localhost:3001/api/docs/structure
GET http://localhost:3001/api/docs/content/intro
```

如果看到这些请求 = **动态加载成功！** ✅

---

### 4️⃣ 测试实时更新

#### 测试A：修改现有文档

```bash
# 在文档末尾添加新内容
echo "

## 🎉 动态更新测试

这段内容是在 $(date) 添加的。

如果你能看到这段内容，说明动态渲染工作正常！

" >> /root/my-website/docs/intro.md
```

**操作**:
1. 运行上面的命令
2. 回到浏览器，刷新页面（不要重启服务器！）
3. 滚动到页面底部

**期望结果**: 看到新添加的 "🎉 动态更新测试" 部分 ✅

---

#### 测试B：创建新文档

```bash
# 创建一个新文档
cat > /root/my-website/docs/dynamic-test.md << 'EOF'
---
title: 动态测试文档
sidebar_position: 2
---

# 动态测试文档

这是一个测试动态渲染的新文档。

## 测试内容

- 列表项 1
- 列表项 2
- 列表项 3

## 代码示例

\`\`\`javascript
console.log('Hello, Dynamic Docs!');
\`\`\`

## 当前时间

文档创建于: $(date)
EOF
```

**操作**:
1. 运行上面的命令创建新文档
2. 回到浏览器，刷新页面
3. 查看左侧侧边栏

**期望结果**:
- ✅ 侧边栏中出现 "Dynamic Test" 或 "dynamic test" 项目
- ✅ 点击后可以查看内容

---

### 5️⃣ 测试导航

在浏览器中：
1. 点击侧边栏中的不同文档链接
2. 观察内容区域是否更新

**期望结果**:
- ✅ 点击后URL改变（如 `/docs/intro` → `/docs/tutorial-basics/create-a-document`）
- ✅ 内容区域动态更新
- ✅ 当前选中的菜单项高亮显示

---

## 对比测试

### 传统方式（已解决的问题）
```bash
# 1. 编辑文档
echo "# 新内容" >> docs/intro.md

# 2. 必须重新构建
yarn build                    # ❌ 耗时30-60秒

# 3. 预览
yarn serve                    # ❌ 还需要额外步骤
```

### 新的动态方式（现在）
```bash
# 1. 编辑文档
echo "# 新内容" >> docs/intro.md

# 2. 刷新浏览器就能看到！
# ✅ 不需要重新构建
# ✅ 立即生效
```

---

## 故障排除

### 问题1：侧边栏没有显示 "（动态）" 标记

**原因**: Docusaurus可能还在使用缓存的组件

**解决方法**:
1. 停止开发服务器（Ctrl+C）
2. 清除缓存：
   ```bash
   rm -rf /root/my-website/.docusaurus
   rm -rf /root/my-website/build
   ```
3. 重新启动：
   ```bash
   yarn start
   ```

---

### 问题2：无法连接到API服务器

**症状**: 浏览器控制台显示 `ERR_CONNECTION_REFUSED` 或 `Failed to fetch`

**解决方法**:
```bash
# 检查API服务器是否运行
curl http://localhost:3001/api/docs/structure

# 如果没有响应，重启API服务器
cd /root/my-website/api-server
node server.js &

# 等待2秒后测试
sleep 2
curl http://localhost:3001/api/docs/structure
```

---

### 问题3：页面显示但没有内容

**可能的原因**:
1. API服务器没有运行
2. 文档路径不正确

**调试步骤**:
```bash
# 1. 测试API
curl http://localhost:3001/api/docs/content/intro

# 2. 检查响应
# 应该看到包含文档内容的JSON
```

---

### 问题4：React组件报错

**症状**: 浏览器显示错误页面

**解决方法**:
1. 查看终端中的错误信息
2. 检查依赖是否安装：
   ```bash
   cd /root/my-website
   yarn install
   ```
3. 重启开发服务器

---

## 验证清单

完成所有测试后，确认以下项目：

- [ ] API服务器运行在 http://localhost:3001
- [ ] Docusaurus运行在 http://localhost:3000
- [ ] 访问 /docs/intro 显示 "📚 文档目录（动态）"
- [ ] 浏览器控制台有对API的网络请求
- [ ] 修改Markdown文件后刷新能看到更新
- [ ] 创建新文档后能在侧边栏看到
- [ ] 点击不同菜单项能切换内容

如果所有项目都打勾 ✅ = **完全成功！** 🎉

---

## 性能对比

### 传统构建方式
- 首次构建: ~30-60秒
- 每次修改后: 需要重新构建
- 查看更新: 需要等待构建完成

### 动态渲染方式
- 首次加载: ~1-2秒（API请求）
- 每次修改后: **0秒**（刷新浏览器即可）
- 查看更新: **立即生效**

---

## 下一步

测试成功后，你可以：

1. **继续开发**: 正常编辑 `docs/` 目录下的文档
2. **添加功能**: 修改 `src/theme/DocPage/index.tsx` 添加新功能
3. **自定义样式**: 编辑 `src/theme/DocPage/styles.module.css`
4. **扩展API**: 在 `api-server/server.js` 添加新接口

---

## 实用命令

```bash
# 查看API服务器进程
ps aux | grep "node server.js"

# 停止API服务器
pkill -f "node server.js"

# 重启整个系统
pkill -f "node server.js"
cd /root/my-website
./start-dynamic.sh

# 查看所有端口占用
lsof -i :3000,3001
```

祝测试顺利！🚀
