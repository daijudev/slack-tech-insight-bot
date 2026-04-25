# slack-tech-insight-bot

技術記事のURLをメンションするだけで、AIが構造化された洞察をSlackスレッドに返すボット。

## 機能

- 記事URLをメンションすると本文を自動取得
- OpenAI GPT-4.1-mini による技術的分析を返信
  - 3行要約 / 技術的な要点 / 深い洞察 / 自チームへの示唆 / 議論すべき問い

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルをプロジェクトルートに作成：

```
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
OPENAI_API_KEY=sk-...
```

### 3. Slack アプリの設定

- Socket Mode を有効化
- Event Subscriptions で `app_mention` を購読
- Bot Token Scopes: `app_mentions:read`, `chat:write`

### 4. 起動

```bash
npm run dev
```

## 使い方

Slackで以下のようにメンションする：

```
@tech-insight-bot https://zenn.dev/some-article
```

## 技術スタック

- [Slack Bolt](https://slack.dev/bolt-js/) — Socket Mode
- [OpenAI SDK](https://github.com/openai/openai-node)
- [cheerio](https://cheerio.js.org/) — 記事本文のスクレイピング
- TypeScript (ESM)
