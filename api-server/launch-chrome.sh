#!/bin/bash
# 启动Chrome远程调试模式（Mac/Linux）
#
# 使用方法：
# chmod +x launch-chrome.sh
# ./launch-chrome.sh

echo ""
echo "===================================================="
echo "  启动Chrome远程调试模式"
echo "===================================================="
echo ""

# 检测操作系统
OS="$(uname -s)"
case "${OS}" in
    Linux*)     MACHINE=Linux;;
    Darwin*)    MACHINE=Mac;;
    *)          MACHINE="UNKNOWN:${OS}"
esac

echo "[+] 操作系统: ${MACHINE}"
echo ""

# 查找Chrome路径
CHROME_PATH=""

if [ "$MACHINE" = "Mac" ]; then
    CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    if [ ! -f "$CHROME_PATH" ]; then
        echo "[错误] 未找到Chrome"
        echo ""
        echo "请确保Chrome已安装在："
        echo "  /Applications/Google Chrome.app/"
        echo ""
        exit 1
    fi
elif [ "$MACHINE" = "Linux" ]; then
    # 尝试多个常见路径
    if command -v google-chrome &> /dev/null; then
        CHROME_PATH="google-chrome"
    elif command -v google-chrome-stable &> /dev/null; then
        CHROME_PATH="google-chrome-stable"
    elif command -v chromium-browser &> /dev/null; then
        CHROME_PATH="chromium-browser"
    elif command -v chromium &> /dev/null; then
        CHROME_PATH="chromium"
    else
        echo "[错误] 未找到Chrome/Chromium"
        echo ""
        echo "请安装Chrome："
        echo "  Ubuntu/Debian: sudo apt install google-chrome-stable"
        echo "  Fedora: sudo dnf install google-chrome-stable"
        echo "  或访问: https://www.google.com/chrome/"
        echo ""
        exit 1
    fi
else
    echo "[错误] 不支持的操作系统: ${MACHINE}"
    exit 1
fi

echo "[+] Chrome路径: ${CHROME_PATH}"
echo ""

# 设置用户数据目录
USER_DATA_DIR="/tmp/chrome-debug"
echo "[+] 数据目录: ${USER_DATA_DIR}"
echo ""

# 启动Chrome
echo "[+] 正在启动Chrome..."
echo ""
echo "提示："
echo "  - Chrome会打开一个新窗口"
echo "  - 这是一个完全正常的Chrome实例"
echo "  - 保持此终端打开"
echo "  - 在另一个终端运行: npm run test:real-chrome"
echo ""

"$CHROME_PATH" \
    --remote-debugging-port=9222 \
    --user-data-dir="$USER_DATA_DIR" \
    > /dev/null 2>&1 &

CHROME_PID=$!

echo "[✓] Chrome已启动 (PID: ${CHROME_PID})"
echo ""
echo "下一步："
echo "  1. 打开新的终端窗口"
echo "  2. cd 到 api-server 目录"
echo "  3. 运行: npm run test:real-chrome"
echo ""
echo "按 Ctrl+C 停止Chrome..."
echo ""

# 等待用户中断
wait $CHROME_PID

