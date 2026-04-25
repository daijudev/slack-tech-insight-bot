import * as cheerio from "cheerio";

export type ArticleContent = {
  url: string;
  title: string;
  text: string;
};

export async function fetchArticleContent(url: string): Promise<ArticleContent> {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; TechInsightBot/1.0; +https://example.com/bot)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("text/html")) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $("meta[property='og:title']").attr("content") ||
      $("title").text() ||
      "Untitled";

    const description =
      $("meta[property='og:description']").attr("content") ||
      $("meta[name='description']").attr("content") ||
      "";

    $("script").remove();
    $("style").remove();
    $("nav").remove();
    $("footer").remove();
    $("header").remove();
    $("noscript").remove();

    const candidates = [
      $("article").text(),
      $("main").text(),
      $("[role='main']").text(),
      $(".article").text(),
      $(".post").text(),
      $(".entry-content").text(),
      $("body").text(),
    ];

    const text = candidates
      .map((value) => value.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)[0];

    const finalText =
      text && text.length >= 200
        ? text
        : `本文を十分に取得できませんでした。メタ情報のみ使用します。\nTitle: ${title}\nDescription: ${description}`;

    return {
      url,
      title: title.trim(),
      text: finalText.slice(0, 20000),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("記事取得がタイムアウトしました");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
