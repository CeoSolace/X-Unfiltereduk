// src/lib/utils/parseMentions.ts
export function parseMentions(text: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_]{3,30})/g;
  const matches = text.matchAll(mentionRegex);
  return Array.from(matches, (m) => m[1].toLowerCase());
}
