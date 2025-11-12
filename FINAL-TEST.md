# ✅ 最终测试指南

## 实现功能

1. ✅ 侧边栏添加"插件"分类（固定）
2. ✅ "插件"下的子项从服务器动态获取
3. ✅ 有下拉箭头，可以展开/折叠
4. ✅ 点击子项时动态获取并渲染内容
5. ✅ 100%使用原生Docusaurus样式

## 启动步骤

### 1. 确保API服务器运行

```bash
# 检查是否已运行
curl http://localhost:3001/api/docs/structure

# 如果没有，启动它
cd /root/my-website/api-server
node server.js &
```

### 2. 启动Docusaurus

```bash
cd /root/my-website
yarn start
```

## 测试场景

### 场景1：查看侧边栏

1. 访问：http://localhost:3000/docs/intro
2. 查看左侧侧边栏
3. 应该看到：
   - Tutorial（原有的）
   - **插件**（新增的，有下拉箭头）
   - Blog（原有的）

### 场景2：展开"插件"分类

1. 点击"插件"分类
2. 应该展开显示6个子项：
   - 欢迎使用动态文档系统
   - API参考（分类）
   - 基础教程（分类）

### 场景3：点击子项

1. 点击"欢迎使用动态文档系统"
2. URL变为：http://localhost:3000/docs/intro
3. 右侧内容动态加载并显示

### 场景4：点击分类下的文档

1. 展开"基础教程"
2. 点击"快速开始"
3. URL变为：http://localhost:3000/docs/基础教程/快速开始
4. 内容动态加载

## 验证原生样式

### 检查点1：侧边栏样式
- [ ] "插件"分类有下拉箭头
- [ ] 点击可以展开/折叠
- [ ] Hover时有背景色变化
- [ ] 当前选中项高亮

### 检查点2：面包屑导航
- [ ] 顶部显示路径（文档 / 基础教程 / 快速开始）
- [ ] 可以点击跳转
- [ ] 使用原生样式

### 检查点3：右侧TOC
- [ ] 自动显示当前文档的标题
- [ ] 类名是 `tableOfContents_bqdL`
- [ ] 滚动时同步高亮

## 数据流验证

### 打开浏览器开发者工具

1. 按F12打开控制台
2. 切换到Network标签
3. 刷新页面
4. 应该看到请求：
   ```
   GET http://localhost:3001/api/docs/structure
   ```

5. 点击任意文档
6. 应该看到请求：
   ```
   GET http://localhost:3001/api/docs/content/xxx
   ```

## 动态更新测试

### 添加新文档

```bash
# 创建新文档
cat > /root/my-website/api-server/docs-data/测试文档.md << 'EOF'
---
title: 测试动态文档
sidebar_position: 100
---

# 测试动态文档

这是测试添加的文档，时间：$(date)

## 章节1

内容1

## 章节2

内容2
EOF

# 重启Docusaurus（Ctrl+C然后yarn start）
# 或者刷新页面，侧边栏应该显示新文档
```

### 修改现有文档

```bash
# 修改文档
echo "

## 新增章节

添加于 $(date)

" >> /root/my-website/api-server/docs-data/intro.md

# 点击对应文档，应该看到新内容
```

## 故障排除

### 问题1：侧边栏没有"插件"分类

**原因**：API服务器未运行或网络请求失败

**解决**：
```bash
# 检查API
curl http://localhost:3001/api/docs/structure

# 查看浏览器控制台是否有错误
```

### 问题2：点击后404

**原因**：路径不对

**检查**：
- URL应该是 `/docs/xxx` 而不是 `/dynamic-docs/xxx`
- 查看浏览器控制台的Network请求

### 问题3：内容没有动态加载

**原因**：DocItem/Content组件的判断逻辑有问题

**解决**：
检查 `src/theme/DocItem/Content/index.tsx` 中的 `isDynamicDoc` 逻辑

### 问题4：样式不对

**原因**：可能CSS没有正确加载

**解决**：
1. 清除缓存：`rm -rf .docusaurus build`
2. 重启：`yarn start`
3. 硬刷新浏览器：Ctrl+Shift+R

## 技术细节

### 使用的官方API

1. **yarn swizzle --wrap** - 包装组件
2. **@theme-original/** - 导入原始组件
3. **PropSidebarItem** - 官方侧边栏类型

### 组件层级

```
DocSidebar (原生)
  └─ DocSidebarItems (Swizzled - 我们的包装)
       └─ DocSidebarItems (原生)
            └─ 原有items + "插件"分类
                 └─ 动态子项
```

### 数据流

```
页面加载
  → DocSidebarItems包装组件挂载
  → fetch API获取结构
  → 转换为PropSidebarItem格式
  → 添加"插件"分类
  → 传递给原生DocSidebarItems
  → 渲染侧边栏

点击文档
  → 跳转到 /docs/xxx
  → DocItem/Content组件加载
  → 检测是动态文档
  → fetch API获取内容
  → ReactMarkdown渲染
  → 应用原生样式类
```

## 成功标志

当你看到以下情况，说明一切正常：

✅ 左侧侧边栏有"插件"分类（有下拉箭头）
✅ 点击展开后显示6个动态子项
✅ 点击子项跳转到 `/docs/xxx` URL
✅ 内容动态加载并正确显示
✅ 面包屑、TOC等原生功能都正常
✅ 所有样式和原生Docusaurus一致

## 下一步

如果一切正常，你可以：

1. 继续添加更多文档到 `api-server/docs-data/`
2. 修改"插件"分类的名称（在DocSidebarItems中）
3. 自定义样式（保持原生类名）
4. 添加更多动态功能

祝测试顺利！🎉


## 快速命令

# 启动所有服务
cd /root/my-website/api-server && node server.js &
yarn start

# 测试API
curl http://localhost:3001/api/docs/structure

# 查看文档
ls -la api-server/docs-data/


