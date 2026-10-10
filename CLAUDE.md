# CLAUDE.md — MUJI STORE app（旧 idea。無印良品スタッフ向けアプリ）

## Codex との分担（Claude の消費を抑える）
- Codex に任せる：仕様が決まっている実装、機械的な大量編集、データ整形、テストの修正。指示は `AGENTS.md` を前提に `codex/<名前>` ブランチ＋プルリクで出す。
- Claude が行う：設計と仕様の判断、プルリクの確認（差分・ビルド・表示の確認）、公開、お客さま向けの文章。
- プルリクの確認を頼まれたら：`git fetch` → 差分を読む → ビルドして構文確認 → 問題点だけを短く返す。全体の作り直しはしない。
- 公開（Artifact）は Claude だけが行う。

## ビルド・公開
- `python3 _dev/editions/muji/build_muji.py <出力先>/index.html`。後片付けとして `__pycache__` を消す。
- コミット後は `muji-edition` に push。
