@echo off
chcp 65001 >nul
echo ╔═══════════════════════════════════════════╗
echo ║   🧪 Temu 爬虫可视化测试                  ║
echo ╚═══════════════════════════════════════════╝
echo.
echo 正在启动测试...
echo.

set HEADLESS=false
set DEBUG=true

npm run test:scraper

echo.
echo 测试完成！按任意键退出...
pause >nul

