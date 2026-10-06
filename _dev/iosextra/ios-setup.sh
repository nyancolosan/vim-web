#!/bin/bash
# Info.plist に、写真・カメラを使う理由などを書き込みます（審査で必須）。
set -e
PL="ios/App/App/Info.plist"
[ -f "$PL" ] || { echo "先に npx cap add ios を実行してください"; exit 1; }
B=/usr/libexec/PlistBuddy
setk(){ $B -c "Delete :$1" "$PL" 2>/dev/null || true; $B -c "Add :$1 $2 $3" "$PL"; }
setk NSPhotoLibraryUsageDescription string "家具の写真をカタログに登録するために、写真ライブラリを使います。"
setk NSPhotoLibraryAddUsageDescription string "作成した3Dパースや図面を写真に保存するために使います。"
setk NSCameraUsageDescription string "家具の写真を撮ってカタログに登録するために、カメラを使います。"
setk CFBundleDisplayName string "VIM"
setk ITSAppUsesNonExemptEncryption bool false
echo "Info.plist を更新しました"
