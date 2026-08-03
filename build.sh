#!/bin/bash
# 城运街道综合管理平台 - 构建打包
# 等价于 Windows 的 打包.bat

set -e

echo "========================================"
echo "   城运街道综合管理平台 - 构建打包"
echo "========================================"
echo ""

# [1/3] 检查环境
echo "[1/3] 检查环境..."
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到 Node.js！请先安装 Node.js。"
    exit 1
fi
echo "[OK] Node.js 已安装"
echo ""

# [2/3] 检查依赖
echo "[2/3] 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
fi
echo "[OK] 依赖已安装"
echo ""

# [3/3] 构建项目
echo "[3/3] 正在构建项目..."
echo ""
npm run build

echo ""
echo "========================================"
echo "   构建成功！"
echo "   输出目录：dist/"
echo "   可以将 dist 目录部署到服务器"
echo "========================================"
