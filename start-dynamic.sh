#!/bin/bash

echo "======================================"
echo "🚀 启动动态文档系统"
echo "======================================"
echo ""

# 检查API服务器是否已在运行
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  API服务器已在端口3001运行"
else
    echo "🔧 启动API服务器 (端口3001)..."
    cd /root/my-website/api-server
    node server.js > /tmp/api-server.log 2>&1 &
    API_PID=$!
    echo "   API服务器 PID: $API_PID"
    sleep 2

    # 验证API服务器
    if curl -s http://localhost:3001/api/docs/structure > /dev/null; then
        echo "   ✅ API服务器启动成功"
    else
        echo "   ❌ API服务器启动失败"
        exit 1
    fi
fi

echo ""
echo "🔧 启动Docusaurus开发服务器 (端口3000)..."
echo "   提示：首次启动可能需要几秒钟..."
echo ""

cd /root/my-website
yarn start

# 这个脚本会阻塞在这里直到Ctrl+C

echo ""
echo "👋 服务已停止"
