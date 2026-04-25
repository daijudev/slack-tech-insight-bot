# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # 開発サーバー起動（dotenvx + tsx でホットリロードなし）
npx tsc --noEmit  # 型チェックのみ（コンパイルなし）
```

## Architecture

Slack の `app_mention` イベントをトリガーに、技術記事のURLを受け取りAI分析結果をスレッドに返すボット。

```
app_mention (Slack)
  → extractFirstUrl()   # src/slack.ts    — SlackのURL形式 <url|text> からURLを抽出
  → fetchArticleContent() # src/article.ts — cheerioでHTML取得・本文抽出（最大20,000文字）
  → analyzeArticle()    # src/ai.ts       — OpenAI GPT-4.1-mini で構造化分析
  → say() (Slack thread reply)
```

- **src/index.ts** — Slack Bolt アプリの初期化とイベントハンドラ
- **src/slack.ts** — URL抽出ユーティリティ
- **src/article.ts** — 記事取得・HTMLパース。`ArticleContent` 型をエクスポート
- **src/ai.ts** — OpenAI呼び出し。`analyzeArticle(article: ArticleContent)` をエクスポート

Slack は Socket Mode で接続（`SLACK_APP_TOKEN` が必要）。

## TypeScript 設定の注意点

- `"type": "module"` + `"module": "nodenext"` → ESM。**相対importには必ず `.js` 拡張子が必要**（例: `./slack.js`）
- `noUncheckedIndexedAccess: true` → 配列の添字アクセスは `string | undefined` になる
- `exactOptionalPropertyTypes: true` → `process.env.XXX` は `?? ""` または `|| ""` で型を絞る

## 必要な環境変数

`.env` ファイルに設定（dotenvx で読み込み）：

```
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
OPENAI_API_KEY=sk-...
```

Slack アプリ側の設定: Socket Mode を有効化し、`app_mention` イベントを購読すること。

## GitHub 運用ルール
- URL:`https://github.com/daijudev/slack-tech-insight-bot.git`
- ツール: GitHub操作には必ず `gh` コマンドを使用する

