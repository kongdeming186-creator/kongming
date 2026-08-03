#!/bin/bash
# 城运街道综合管理平台 - 启动开发服务器
# 等价于 Windows 的 启动.bat

set -e

echo "========================================"
echo "   城运街道综合管理平台"
echo "========================================"
echo ""

# [1/3] 检查 Node.js 环境
echo "[1/3] 正在检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js！"
    echo "请先安装 Node.js LTS 版本：https://nodejs.org/"
    exit 1
fi
echo "[OK] Node.js 已安装"
node --version
echo ""

# [2/3] 检查依赖
echo "[2/3] 检查依赖是否已安装..."
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖（首次运行需要几分钟）..."
    npm install
    echo "[OK] 依赖安装完成"
else
    echo "[OK] 依赖已安装"
fi
echo ""

# [3/3] 启动开发服务器
echo "[3/3] 正在启动开发服务器..."
echo ""
echo "========================================"
echo "   启动成功后，请在浏览器中访问："
echo "   http://localhost:5173/"
echo "========================================"
echo ""
echo "提示：按 Ctrl+C 可以停止服务器"
echo ""

npm run dev
