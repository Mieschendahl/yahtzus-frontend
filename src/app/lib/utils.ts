export function sum(ls: number[]): number {
  return ls.reduce((a, b) => a + b, 0);
}

export function prettyNone(text: string | undefined | null): string {
  if (!text)
    return "\u00A0";
  return text;
}