import { App } from "@slack/bolt";
import dotenv from "dotenv";
import { extractFirstUrl } from "./slack.js";
import { fetchArticleContent } from "./article.js";

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN ?? "",
  appToken: process.env.SLACK_APP_TOKEN ?? "",
  socketMode: true,
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
    text: "記事を取得しています...",
    thread_ts: event.ts,
  });

  try {
    const article = await fetchArticleContent(url);

    await say({
      text: `記事を取得しました。\nタイトル: ${article.title}\n本文文字数: ${article.text.length}`,
      thread_ts: event.ts,
    });
  } catch (error) {
    await say({
      text: `記事本文の取得に失敗しました。\nURL: ${url}`,
      thread_ts: event.ts,
    });
  }
});

(async () => {
  await app.start();
  console.log("⚡️ tech-insight-bot is running");
})();
