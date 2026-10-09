#!/bin/bash
# gas-project/App.html（正本）をGitHub Pages用のindex.htmlへコピーし、ホーム画面アイコンを付ける。
set -euo pipefail
cd "$(dirname "$0")"
cp ../gas-project/App.html index.html
sed -i '' 's#<meta name="apple-mobile-web-app-title" content="時間管理">#<meta name="apple-mobile-web-app-title" content="時間管理">\n<link rel="apple-touch-icon" href="icon.png?v=1">\n<link rel="icon" href="icon.png?v=1">#' index.html
echo "index.html を更新しました"
