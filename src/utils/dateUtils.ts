import { SnapMode } from '../types/planner';

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const MONTH_FULL_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

export function getMonthStartDayOfYear(year: number, monthIndex: number): number {
  let day = 0;
  for (let m = 0; m < monthIndex; m++) {
    day += getDaysInMonth(year, m);
  }
  return day;
}

/**
 * Converts a date string 'YYYY-MM-DD' into a day of year (0-indexed, 0 = Jan 1).
 */
export function dateToDayOfYear(dateStr: string, year: number): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetYear = y || year;
  let day = (d || 1) - 1;
  const monthIdx = Math.max(0, Math.min(11, (m || 1) - 1));

  for (let i = 0; i < monthIdx; i++) {
    day += getDaysInMonth(targetYear, i);
  }
  return Math.max(0, Math.min(getDaysInYear(targetYear) - 1, day));
}

/**
 * Converts day of year (0-indexed, float or int) back to 'YYYY-MM-DD'.
 */
export function dayOfYearToDate(dayOfYear: number, year: number): string {
  const totalDays = getDaysInYear(year);
  let clampedDay = Math.max(0, Math.min(totalDays - 1, Math.floor(dayOfYear)));

  let month = 0;
  while (month < 12) {
    const daysInCurrentMonth = getDaysInMonth(year, month);
    if (clampedDay < daysInCurrentMonth) {
      break;
    }
    clampedDay -= daysInCurrentMonth;
    month++;
  }

  const mStr = String(Math.min(12, month + 1)).padStart(2, '0');
  const dStr = String(clampedDay + 1).padStart(2, '0');
  return `${year}-${mStr}-${dStr}`;
}

/**
 * Converts a date to percentage position [0, 1] within the year.
 */
export function dateToFraction(dateStr: string, year: number): number {
  const day = dateToDayOfYear(dateStr, year);
  const totalDays = getDaysInYear(year);
  return day / totalDays;
}

/**
 * Converts a fraction [0, 1] into a snapped date string 'YYYY-MM-DD'.
 */
export function fractionToDate(fraction: number, year: number, snapMode: SnapMode = 'day'): string {
  const totalDays = getDaysInYear(year);
  let rawDay = fraction * totalDays;

  if (snapMode === 'month') {
    // Snap to 1st of closest month
    let bestDay = 0;
    let minDiff = Infinity;
    for (let m = 0; m <= 12; m++) {
      const monthStart = m === 12 ? totalDays : getMonthStartDayOfYear(year, m);
      const diff = Math.abs(rawDay - monthStart);
      if (diff < minDiff) {
        minDiff = diff;
        bestDay = Math.min(totalDays - 1, monthStart);
      }
    }
    rawDay = bestDay;
  } else if (snapMode === 'half-month') {
    // Snap to 1st or 15th
    let bestDay = 0;
    let minDiff = Infinity;
    for (let m = 0; m < 12; m++) {
      const start = getMonthStartDayOfYear(year, m);
      const mid = start + 14; // 15th
      for (const target of [start, mid]) {
        const diff = Math.abs(rawDay - target);
        if (diff < minDiff) {
          minDiff = diff;
          bestDay = target;
        }
      }
    }
    rawDay = bestDay;
  } else if (snapMode === 'week') {
    rawDay = Math.round(rawDay / 7) * 7;
  } else {
    // day or none: integer day
    rawDay = Math.round(rawDay);
  }

  rawDay = Math.max(0, Math.min(totalDays - 1, rawDay));
  return dayOfYearToDate(rawDay, year);
}

/**
 * Adds or subtracts days from a date string.
 */
export function addDays(dateStr: string, daysToAdd: number, year: number): string {
  const currentDay = dateToDayOfYear(dateStr, year);
  const totalDays = getDaysInYear(year);
  const newDay = Math.max(0, Math.min(totalDays - 1, currentDay + daysToAdd));
  return dayOfYearToDate(newDay, year);
}

/**
 * Calculates duration in days between two dates inclusive.
 */
export function getDurationDays(startDate: string, endDate: string, year: number): number {
  const start = dateToDayOfYear(startDate, year);
  const end = dateToDayOfYear(endDate, year);
  return Math.max(1, end - start + 1);
}

/**
 * Formats a single date into 'MMM d', e.g., 'May 1', 'Jun 29'.
 */
export function formatSingleDate(dateStr: string): string {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-').map(Number);
  const monthName = MONTH_NAMES[(m || 1) - 1] || 'Jan';
  return `${monthName} ${d || 1}`;
}

/**
 * Formats a date range into 'MMM d - MMM d', matching the user's screenshot.
 * E.g., 'May 1 - Jun 29'
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const startFmt = formatSingleDate(startDate);
  const endFmt = formatSingleDate(endDate);
  return `${startFmt} - ${endFmt}`;
}

/**
 * Checks if current real-world date is in the selected year, and returns its fractional position.
 */
export function getTodayFraction(year: number): { isThisYear: boolean; fraction: number; dateStr: string } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const isThisYear = currentYear === year;

  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dateStr = `${currentYear}-${m}-${d}`;

  if (!isThisYear) {
    return { isThisYear: false, fraction: 0, dateStr };
  }

  const fraction = dateToFraction(dateStr, year);
  return { isThisYear: true, fraction, dateStr };
}

/**
 * Generates month column metadata with pixel percentages for grid lines.
 */
export function getMonthColumns(year: number) {
  const totalDays = getDaysInYear(year);
  return MONTH_NAMES.map((name, index) => {
    const daysInMonth = getDaysInMonth(year, index);
    const startDay = getMonthStartDayOfYear(year, index);
    const leftPercent = (startDay / totalDays) * 100;
    const widthPercent = (daysInMonth / totalDays) * 100;
    const quarter = Math.floor(index / 3) + 1;

    return {
      index,
      name,
      fullName: MONTH_FULL_NAMES[index],
      quarter,
      daysInMonth,
      startDay,
      leftPercent,
      widthPercent,
    };
  });
}
