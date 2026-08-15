@echo off
chcp 65001 >nul
title 查看手机访问地址
echo.
echo  本机在局域网中的访问地址如下：
echo.
powershell -NoProfile -Command "$ips = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' }).IPAddress; if ($ips) { $ips | ForEach-Object { Write-Host ('  http://' + $_ + ':4173') } } else { Write-Host '  未找到局域网地址，请检查网络连接' }"
echo.
echo  使用方法：
echo    1. 先双击《启动学习助手.bat》保持服务器运行
echo    2. 手机连接和电脑同一个 Wi-Fi
echo    3. 在手机浏览器输入上面的地址即可访问
echo.
pause
