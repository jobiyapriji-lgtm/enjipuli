/**
 * IST (India Standard Time) date utilities.
 *
 * All date strings in this app represent IST calendar days (YYYY-MM-DD).
 * This prevents the UTC midnight boundary issue where
 * `new Date().toISOString().split('T')[0]` returns the previous day
 * between 12:00 AM and 5:30 AM IST.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +5:30

/**
 * Returns today's date string in YYYY-MM-DD format, in IST.
 */
export function getTodayIST(): string {
  const now = new Date();
  const istTime = new Date(now.getTime() + IST_OFFSET_MS);
  return istTime.toISOString().split('T')[0];
}

/**
 * Returns a Date object representing the start of today (midnight) in IST,
 * expressed as a UTC Date for database queries.
 *
 * Example: At 2:00 AM IST on Sept 26, this returns Sept 25 18:30 UTC
 * (which is Sept 26 00:00 IST).
 */
export function getTodayStartIST(): Date {
  const todayStr = getTodayIST();
  const [year, month, day] = todayStr.split('-').map(Number);
  // Midnight IST expressed in UTC
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - IST_OFFSET_MS);
}

/**
 * Converts a Date (e.g., order.createdAt) to its IST date string (YYYY-MM-DD).
 * Use this to look up the correct DailyStock row for an order.
 */
export function dateToISTString(date: Date): string {
  const istTime = new Date(date.getTime() + IST_OFFSET_MS);
  return istTime.toISOString().split('T')[0];
}
