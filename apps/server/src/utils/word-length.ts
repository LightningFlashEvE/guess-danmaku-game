/** 按 Unicode 码点计数字符数（中文一字算一个） */
export function charCount(text: string): number {
  return Array.from(text).length;
}

export function isTwoCharWord(text: string): boolean {
  return charCount(text) === 2;
}
