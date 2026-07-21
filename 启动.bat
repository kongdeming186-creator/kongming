@echo off
chcp 65001 >nul
title 城运街道综合管理平台 - 启动中...

echo ========================================
echo    城运街道综合管理平台
echo ========================================
echo.
echo [1/4] 正在检查 Node.js 环境...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [错误] 未检测到 Node.js！
    echo.
    echo 请先安装 Node.js LTS 版本：
    echo 下载地址：https://nodejs.org/
    echo.
    echo 安装时请务必勾选 "Add to PATH" 选项
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js 已安装
node --version

echo.
echo [2/4] 检查依赖是否已安装...
if not exist "node_modules" (
    echo 正在安装依赖（首次运行需要几分钟）...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [错误] 依赖安装失败！
        echo.
        echo 请尝试手动运行：npm install
        echo.
        pause
        exit /b 1
    )
    echo [OK] 依赖安装完成
) else (
    echo [OK] 依赖已安装
)

echo.
echo [3/4] 正在启动开发服务器...
echo.
echo ========================================
echo   启动成功后，请在浏览器中访问：
echo   http://localhost:5173/
echo ========================================
echo.
echo 提示：按 Ctrl+C 可以停止服务器
echo.

call npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [错误] 启动失败！
    echo.
    echo 可能的原因：
    echo 1. 端口 5173 被占用
    echo 2. 依赖未正确安装
    echo.
    echo 请尝试运行：npm install
    echo.
    pause
    exit /b 1
)

pause
