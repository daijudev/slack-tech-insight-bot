import { App } from "@slack/bolt";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { extractFirstUrl } from "./slack.js";
import { fetchArticleContent } from "./article.js";
import { analyzeArticle } from "./ai.js";

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN ?? "",
  appToken: process.env.SLACK_APP_TOKEN ?? "",
  socketMode: true,
});

slackApp.event("app_mention", async ({ event, say }) => {
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

const webhookApp = new Hono();

webhookApp.post("/webhook/instapaper", async (c) => {
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && c.req.header("x-webhook-secret") !== secret) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json<{ title?: string; url?: string }>();
  const { title, url } = body;

  if (!url) {
    return c.json({ error: "url is required" }, 400);
  }

  const channelId = process.env.SLACK_CHANNEL_ID ?? "";
  if (!channelId) {
    console.error("SLACK_CHANNEL_ID is not set");
    return c.json({ error: "Server configuration error" }, 500);
  }

  const articleTitle = title ?? url;

  // 非同期で処理（Zapierがタイムアウトしないよう即座に200を返す）
  void (async () => {
    try {
      const postResult = await slackApp.client.chat.postMessage({
        channel: channelId,
        text: `📚 *${articleTitle}*\n${url}\n_Instapaperより自動共有_`,
      });

      const threadTs = postResult.ts as string;

      const article = await fetchArticleContent(url);
      const analysis = await analyzeArticle(article);

      await slackApp.client.chat.postMessage({
        channel: channelId,
        thread_ts: threadTs,
        text: analysis,
      });
    } catch (error) {
      console.error("Instapaper webhook processing error:", error);
    }
  })();

  return c.json({ ok: true });
});

(async () => {
  await slackApp.start();
  console.log("⚡️ tech-insight-bot is running");

  const port = Number(process.env.WEBHOOK_PORT ?? "3000");
  serve({ fetch: webhookApp.fetch, port });
  console.log(`🔗 Webhook server listening on port ${port}`);
})();