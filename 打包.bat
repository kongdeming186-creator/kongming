@echo off
chcp 65001 >nul
title 城运街道综合管理平台 - 构建打包

echo ========================================
echo    城运街道综合管理平台 - 构建打包
echo ========================================
echo.
echo [1/3] 检查环境...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js！请先安装 Node.js。
    pause
    exit /b 1
)
echo [OK] Node.js 已安装

echo.
echo [2/3] 检查依赖...
if not exist "node_modules" (
    echo 正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败！
        pause
        exit /b 1
    )
)
echo [OK] 依赖已安装

echo.
echo [3/3] 正在构建项目...
echo.
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   构建成功！
    echo   输出目录：dist/
    echo   可以将 dist 目录部署到服务器
    echo ========================================
) else (
    echo.
    echo [错误] 构建失败！
)

echo.
pause
