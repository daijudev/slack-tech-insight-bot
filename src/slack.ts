export function extractFirstUrl(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s>|]+)/;
  const match = text.match(urlRegex);

  if (!match) return null;

  return match[1]!.replace(/[>)\]]$/, "");
}
