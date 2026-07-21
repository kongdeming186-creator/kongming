@echo off
chcp 65001 >nul
title 城运街道综合管理平台 - 远程访问服务

echo ========================================
echo    城运街道综合管理平台
echo    远程访问模式
echo ========================================
echo.

echo [提示] 启动后，其他电脑可以通过以下地址访问：
echo.
echo   http://本机IP地址:5173/
echo.
echo [提示] 查看本机IP地址：
echo   运行 ipconfig 命令
echo.
echo 正在检查是否已打包...
if not exist "dist" (
    echo [1/2] 正在打包项目（首次需要几分钟）...
    call npm run build
    echo.
)

echo [2/2] 正在启动远程访问服务...
echo.
echo ========================================
echo   按 Ctrl+C 可停止服务
echo ========================================
echo.

npx serve dist -l 5173 -p

pause
