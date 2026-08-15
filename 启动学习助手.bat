@echo off
chcp 65001 >nul
title 学位英语备考助手
echo.
echo  ==========================================
echo    学位英语备考助手 - 启动中...
echo  ==========================================
echo.

cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [错误] 未检测到 Node.js，请先安装：https://nodejs.org/zh-cn
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo 首次运行，正在安装依赖（约1-3分钟，只需一次）...
  call npm install
)

echo 正在构建（首次约10秒）...
call npm run build

echo.
echo  [OK] 构建完成！正在启动服务器...
echo  [提示] 请保持本窗口打开，不要关闭！
echo  [提示] 启动后会自动打开浏览器；手机访问请双击《查看手机访问地址.bat》
echo.

start "" http://localhost:4173
call npm run preview
pause
