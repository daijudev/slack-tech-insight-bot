import { App } from "@slack/bolt";
import dotenv from "dotenv";
import { extractFirstUrl } from "./slack.js";
import { fetchArticleContent } from "./article.js";
import { analyzeArticle } from "./ai.js";

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN || '',
  appToken: process.env.SLACK_APP_TOKEN || '',
  socketMode: true || '',
});

app.event("app_mention", async ({ event, say }) => {
  if (!("text" in event)) return;

  const url = extractFirstUrl(event.text);

  if (!url) {
    await say({
      text: "URLが見つかりませんでした。技術記事のURLを含めてメンションしてください。",
      thread_ts: event.ts,
    });
    return;
  }

  await say({
    text: "記事を取得してAIで分析しています...",
    thread_ts: event.ts,
  });

  try {
    const article = await fetchArticleContent(url);
    const analysis = await analyzeArticle(article);

    await say({
      text: analysis,
      thread_ts: event.ts,
    });
  } catch (error) {
    console.error(error);

    await say({
      text: `記事分析に失敗しました。\nURL: ${url}\n原因: 記事本文の取得失敗、またはAI分析エラーの可能性があります。`,
      thread_ts: event.ts,
    });
  }
});

(async () => {
  await app.start();
  console.log("⚡️ tech-insight-bot is running");
})();