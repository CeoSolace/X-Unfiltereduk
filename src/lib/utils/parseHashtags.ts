// src/lib/utils/parseHashtags.ts
export function parseHashtags(text: string): string[] {
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
  const matches = text.matchAll(hashtagRegex);
  return Array.from(matches, (m) => m[1].toLowerCase());
}
