/**
 * Format milliseconds into human-readable format
 * Examples:
 *   5000 -> "5s"
 *   65000 -> "1m 5s"
 *   3661000 -> "1h 1m"
 */
export function formatTime(milliseconds) {
  if (milliseconds < 0) return '0s';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  
  // Return at most 2 parts (e.g., "1h 24m" not "1h 24m 5s")
  return parts.slice(0, 2).join(' ');
}

/**
 * Format milliseconds into short format for display
 * Examples:
 *   65000 -> "1m"
 *   3661000 -> "1h"
 */
export function formatTimeShort(milliseconds) {
  if (milliseconds < 0) return '0m';
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${totalSeconds}s`;
}

/**
 * Get today's date in YYYY-MM-DD format using Indian Standard Time (IST)
 */
export function getTodayDateKey() {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  const year = istTime.getUTCFullYear();
  const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istTime.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date key for N days ago using Indian Standard Time (IST)
 */
export function getDateKeyNDaysAgo(daysAgo) {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  istTime.setUTCDate(istTime.getUTCDate() - daysAgo);
  const year = istTime.getUTCFullYear();
  const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istTime.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date key (YYYY-MM-DD) into readable format
 */
export function formatDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-');
  const date = new Date(year, parseInt(month) - 1, day);
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
