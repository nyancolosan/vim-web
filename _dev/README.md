# 開発用の元ファイル（公開されません）

- `furniture-catalog.html` … アプリ本体の元ファイル（Claudeのアーティファクト版と同じ）
- `build_web.py` → Web版（`bimini-web/`）を作る。`build_netlify.py` → それをNetlify用（このリポジトリの直下）に組み直す
- `build_ios.py` → iOS版（Capacitor）一式を作る
- `netlifyextra/api.mjs` … 課金サーバー（Netlify Functions）の元。`webextra/` … 特商法・プライバシー・設定。`iosextra/` … iOS版の追加ファイル
- スクリプト内のパス（/mnt/user-data/outputs など）は作業環境に合わせて読み替えてください

更新の流れ（3.0から）：元ファイルを直す → `python3 _dev/build.py 3.0.1`（index.html と sw.js を更新）→ push（Netlifyが自動で公開）

- `build.py` … リポジトリの中だけで index.html を組み立てる（古い build_web.py／build_netlify.py は /mnt/user-data 前提のため使わない）
- `patches/` … 3.0 で元ファイルに入れた変更の記録（適用済み。再実行はしない）
