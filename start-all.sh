#!/bin/bash

# 启动API服务器和Docusaurus开发服务器

echo "🚀 启动API服务器..."
cd api-server && npm start &
API_PID=$!

# 等待API服务器启动
sleep 3

echo "🚀 启动Docusaurus开发服务器..."
cd ..
yarn start &
DOCUSAURUS_PID=$!

echo ""
echo "✅ 服务已启动:"
echo "  - API服务器: http://localhost:3001"
echo "  - Docusaurus: http://localhost:3000"
echo "  - 动态文档页面: http://localhost:3000/dynamic-docs"
echo ""
echo "按 Ctrl+C 停止所有服务..."

# 捕获退出信号，清理进程
trap "echo ''; echo '停止服务...'; kill $API_PID $DOCUSAURUS_PID; exit" INT TERM

# 等待
wait
