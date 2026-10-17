/**
 * Time and Indian Standard Time (IST) Boundary Helpers
 * Enforces §3 Rule 9:
 * "Time: store UTC milliseconds. India has no daylight saving, so IST day start is:
 * floor((ms + 19800000) / 86400000) * 86400000 - 19800000"
 */

const IST_OFFSET_MS = 19_800_000; // +05:30 in milliseconds (5 * 3600 + 30 * 60) * 1000
const ONE_DAY_MS = 86_400_000; // 24 * 3600 * 1000

/**
 * Returns the UTC timestamp in milliseconds corresponding to 00:00:00.000 IST
 * for the given UTC millisecond timestamp.
 *
 * @param utcMs UTC timestamp in milliseconds
 * @returns UTC timestamp in milliseconds marking the start of that day in IST
 */
export function getIstDayStart(utcMs: number): number {
  return Math.floor((utcMs + IST_OFFSET_MS) / ONE_DAY_MS) * ONE_DAY_MS - IST_OFFSET_MS;
}

/**
 * Returns the UTC timestamp in milliseconds corresponding to 23:59:59.999 IST
 * for the given UTC millisecond timestamp.
 *
 * @param utcMs UTC timestamp in milliseconds
 * @returns UTC timestamp in milliseconds marking the end of that day in IST
 */
export function getIstDayEnd(utcMs: number): number {
  return getIstDayStart(utcMs) + ONE_DAY_MS - 1;
}

/**
 * Checks whether two UTC timestamps fall within the exact same day in Indian Standard Time (IST).
 */
export function isSameIstDay(utcMs1: number, utcMs2: number): boolean {
  return getIstDayStart(utcMs1) === getIstDayStart(utcMs2);
}
