役割分担と進め方は @AGENTS.md を参照。

- 変更案（PR）は REST API で作る：`gh api repos/nyancolosan/vim-web/pulls -X POST -f title=... -f head=ブランチ -f base=main -f body=...`（`gh pr create` は使えない）
- 単純作業は自分でやらず、PR の説明かコメントに `@codex` で依頼を書いて Codex に任せる
