// "Today" as seen from home, so the birthday countdown and seasons flip at local midnight.
export const TIMEZONE = process.env.TIMEZONE || 'Asia/Bangkok';

// en-CA formats as YYYY-MM-DD
export function todayIn(timeZone = TIMEZONE) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export function seasonOf(date) {
  const month = Number(date.slice(5, 7));
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}
