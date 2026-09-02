/**
 * Time formatting utilities.
 */

/** Format a timestamp into a relative time string (e.g., "5m ago", "2h ago", "3d ago") */
export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);

  if (seconds < 60) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  if (weeks < 4) {
    return `${weeks}w ago`;
  }
  // Use absolute date for older items
  return formatDate(timestamp);
}

/** Format a timestamp into a date string (e.g., "Sep 2") */
export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  return `${month} ${day}`;
}

/** Format a timestamp into a date-time string (e.g., "Sep 2, 2024") */
export function formatDateFull(timestamp: number): string {
  const d = new Date(timestamp);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}

/** Get the day of week name (e.g., "Wednesday") */
export function getDayOfWeek(timestamp: number = Date.now()): string {
  const d = new Date(timestamp);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[d.getDay()];
}

/** Get the month name (e.g., "September") */
export function getMonthName(timestamp: number = Date.now()): string {
  const d = new Date(timestamp);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[d.getMonth()];
}

/** Format time as HH:MM (12-hour) */
export function formatTime12h(timestamp: number = Date.now()): string {
  const d = new Date(timestamp);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

/** Format time as HH:MM (24-hour) */
export function formatTime24h(timestamp: number = Date.now()): string {
  const d = new Date(timestamp);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
