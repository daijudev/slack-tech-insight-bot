import OpenAI from "openai";
import type { ArticleContent } from "./article.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeArticle(article: ArticleContent): Promise<string> {
  const prompt = `
あなたはシニアエンジニア兼技術戦略アドバイザーです。
以下の技術記事を読み、Slackスレッドに返信する形式で分析してください。

目的:
- 単なる要約ではなく、チームの意思決定に使える洞察を出す
- フロントエンド、開発生産性、AI活用、大規模開発の観点を重視する
- 誇張せず、導入リスクも明確にする

出力形式:
## 3行要約
- 
- 
- 

## 技術的な要点
1. 
2. 
3. 

## 深い洞察
この記事が本質的に示している変化を説明してください。

## 自社・自チームへの示唆
- 
- 
- 

## 導入する場合の最初の一歩
- 

## 議論すべき問い
1. 
2. 
3. 

記事タイトル:
${article.title}

記事URL:
${article.url}

記事本文:
${article.text}
`;

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  return response.output_text;
}