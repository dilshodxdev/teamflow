/**
 * Date utilities for TeamFlow (Asia/Tashkent context)
 */

export const UZ_MONTHS = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

export const UZ_WEEKDAYS_SHORT = [
  "Dush",
  "Sesh",
  "Chor",
  "Pay",
  "Jum",
  "Shan",
  "Yak",
];
export const UZ_WEEKDAYS_LONG = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Tashkent timezone
 */
export function getTodayDateString(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/**
 * Format YYYY-MM-DD string to Uzbek text: "14 May 2025" or "14 May"
 */
export function formatUzbekDate(dateStr: string, includeYear = true): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  const year = parts[0];
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const monthName = UZ_MONTHS[monthIndex] || parts[1];
  return includeYear ? `${day} ${monthName} ${year}` : `${day} ${monthName}`;
}

/**
 * Checks if a task is overdue.
 * Requirement: dueDate is before today and status is not done.
 */
export function isTaskOverdue(dueDateStr: string, status: string): boolean {
  if (status === "done") return false;
  const today = getTodayDateString();
  return dueDateStr < today;
}

/**
 * Checks if a date string matches today in Asia/Tashkent
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDateString();
}

/**
 * Parse YYYY-MM-DD to Date object
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/**
 * Format Date object to YYYY-MM-DD
 */
export function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get days in month
 */
export function getDaysInMonth(year: number, monthZeroIndexed: number): number {
  return new Date(year, monthZeroIndexed + 1, 0).getDate();
}

/**
 * Get Monday-first day of week (0 = Monday, 6 = Sunday)
 */
export function getFirstDayOfWeekMonday(
  year: number,
  monthZeroIndexed: number,
): number {
  const sundayFirst = new Date(year, monthZeroIndexed, 1).getDay();
  // sundayFirst: 0 = Sun, 1 = Mon, ..., 6 = Sat
  return (sundayFirst + 6) % 7;
}
