/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Sample n random items from array without repetition
 */
export function sampleWithoutReplacement<T>(array: T[], n: number): T[] {
  if (n >= array.length) return shuffleArray(array);
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, n);
}

/**
 * Trim and truncate string to max length
 */
export function sanitizeString(str: string, maxLength: number): string {
  return str.trim().slice(0, maxLength);
}

/**
 * Validate player name: non-empty, max 15 chars
 */
export function validatePlayerName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  if (!trimmed) return { valid: false, error: 'Player name is required' };
  if (trimmed.length > 15) return { valid: false, error: 'Player name must be 15 characters or fewer' };
  return { valid: true };
}

/**
 * Parse integer with fallback
 */
export function parseIntSafe(value: unknown, fallback: number): number {
  const n = parseInt(String(value), 10);
  return isNaN(n) ? fallback : n;
}
