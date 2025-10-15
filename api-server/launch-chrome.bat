@echo off
REM 启动Chrome远程调试模式（Windows）
REM 
REM 使用方法：
REM 1. 双击运行此文件
REM 2. 然后运行 npm run test:real-chrome

echo.
echo ====================================================
echo   启动Chrome远程调试模式
echo ====================================================
echo.

REM 查找Chrome路径
set CHROME_PATH=
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    set CHROME_PATH=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe
)

if "%CHROME_PATH%"=="" (
    echo [错误] 未找到Chrome
    echo.
    echo 请确保Chrome已安装在以下位置之一：
    echo   - C:\Program Files\Google\Chrome\Application\
    echo   - C:\Program Files (x86)\Google\Chrome\Application\
    echo   - %LOCALAPPDATA%\Google\Chrome\Application\
    echo.
    pause
    exit /b 1
)

echo [+] Chrome路径: %CHROME_PATH%
echo.

REM 设置用户数据目录
set USER_DATA_DIR=%TEMP%\chrome-debug
echo [+] 数据目录: %USER_DATA_DIR%
echo.

REM 启动Chrome
echo [+] 正在启动Chrome...
echo.
echo 提示：
echo   - Chrome会打开一个新窗口
echo   - 这是一个完全正常的Chrome实例
echo   - 保持此窗口打开
echo   - 在另一个终端运行: npm run test:real-chrome
echo.

start "" "%CHROME_PATH%" --remote-debugging-port=9222 --user-data-dir="%USER_DATA_DIR%"

echo [✓] Chrome已启动
echo.
echo 下一步：
echo   1. 打开新的命令行窗口
echo   2. cd 到 api-server 目录
echo   3. 运行: npm run test:real-chrome
echo.
echo 按任意键退出此窗口...
pause >nul

