export function formatTokenCount(tokens: number | null | undefined): string | null {
  if (tokens == null) return null;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`;
  return tokens.toString();
}
