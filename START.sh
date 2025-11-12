#!/bin/bash

echo "================================================"
echo "🚀 启动完整动态文档系统"
echo "================================================"
echo ""

# 检查是否在正确的目录
if [ ! -d "api-server" ]; then
    echo "❌ 错误：请在 my-website 目录下运行此脚本"
    exit 1
fi

# 停止可能已运行的服务
echo "🧹 清理旧进程..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "yarn start" 2>/dev/null || true
sleep 1

# 启动API服务器
echo ""
echo "📡 启动API服务器 (端口3001)..."
cd api-server
node server.js > /tmp/docs-api.log 2>&1 &
API_PID=$!
cd ..

# 等待API服务器就绪
echo "   等待API服务器启动..."
sleep 3

# 验证API服务器
if curl -s http://localhost:3001/api/docs/structure > /dev/null 2>&1; then
    echo "   ✅ API服务器启动成功 (PID: $API_PID)"
    echo "   📄 日志文件: /tmp/docs-api.log"
else
    echo "   ❌ API服务器启动失败，查看日志: tail -f /tmp/docs-api.log"
    exit 1
fi

# 显示文档目录
echo ""
echo "📚 当前文档列表:"
curl -s http://localhost:3001/api/docs/structure | python3 -m json.tool 2>/dev/null | grep '"label"' | head -10 || echo "   (无法显示，但服务器正在运行)"

echo ""
echo "================================================"
echo "✅ API服务器已启动"
echo "================================================"
echo ""
echo "📖 可用的中文文档："
echo "   • intro - 欢迎使用动态文档系统"
echo "   • 基础教程/快速开始"
echo "   • 基础教程/Markdown语法"
echo "   • 基础教程/高级功能"
echo "   • API参考/接口文档"
echo "   • API参考/数据模型"
echo ""
echo "🌐 下一步："
echo "   1. 在另一个终端运行: yarn start"
echo "   2. 访问: http://localhost:3000/docs/intro"
echo "   3. 体验完整功能："
echo "      • 左侧折叠菜单"
echo "      • 面包屑导航"
echo "      • 右侧目录(TOC)"
echo ""
echo "📝 测试动态更新："
echo '   echo "## 新章节" >> api-server/docs-data/intro.md'
echo "   然后刷新浏览器即可看到更新！"
echo ""
echo "🛑 停止服务："
echo "   pkill -f 'node server.js'"
echo ""
echo "================================================"
