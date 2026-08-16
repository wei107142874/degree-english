@echo off
title Fix LAN access - Degree English helper
net session >nul 2>&1
if not "%errorlevel%"=="0" (
    echo Requesting administrator privileges...
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)
echo ================================================
echo   Fix: let your phone access this PC (port 4173)
echo ================================================
echo.
netsh advfirewall firewall delete rule name="DegreeEnglish-LAN-4173" >nul 2>&1
netsh advfirewall firewall add rule name="DegreeEnglish-LAN-4173" dir=in action=allow program="D:\Soft\nodejs\node.exe" enable=yes profile=any protocol=TCP localport=4173
if %errorlevel%==0 (
    echo [OK] Firewall rule added: allow node.exe TCP 4173 inbound
) else (
    echo [FAIL] Could not add the rule. Check the message above.
)
echo.
echo [INFO] Your PC LAN IP addresses:
ipconfig | findstr /i "IPv4"
echo.
echo [USE THIS ON YOUR PHONE]  http://192.168.31.194:4173/
echo   This is the PC's current IP. If it changed, use the
echo   192.168.31.x address listed above. Do NOT use 192.168.224.1
echo   (Hyper-V) or 192.168.56.1 (VirtualBox).
echo.
echo [IF IT STILL FAILS]
echo   1. Exit Tencent PC Manager (QQ PC Manager) and retry
echo   2. Make sure the phone is on the SAME Wi-Fi as the PC
echo      (phone IP must be 192.168.31.x too)
echo   3. On the Xiaomi router: turn OFF AP isolation / guest network
echo.
pause