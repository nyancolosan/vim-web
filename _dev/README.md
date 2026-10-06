# 開発用の元ファイル（公開されません）

- `furniture-catalog.html` … アプリ本体の元ファイル（Claudeのアーティファクト版と同じ）
- `build_web.py` → Web版（`bimini-web/`）を作る。`build_netlify.py` → それをNetlify用（このリポジトリの直下）に組み直す
- `build_ios.py` → iOS版（Capacitor）一式を作る
- `netlifyextra/api.mjs` … 課金サーバー（Netlify Functions）の元。`webextra/` … 特商法・プライバシー・設定。`iosextra/` … iOS版の追加ファイル
- スクリプト内のパス（/mnt/user-data/outputs など）は作業環境に合わせて読み替えてください

更新の流れ：元ファイルを直す → build_web.py → build_netlify.py → 生成物をリポジトリ直下に上書き → push（Netlifyが自動で公開）
