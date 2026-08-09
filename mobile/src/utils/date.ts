/**
 * Date utility functions
 */

export const formatDate = (dateStr: string | Date, locale: string = 'en-GB'): string => {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateStr: string | Date): string => {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateStr: string | Date): string => {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

export const calculateAgeInMonths = (dob: string): number => {
  return ageInMonthsAt(dob, new Date());
};

// Age in whole months as of a given reference date (e.g. the date a growth
// measurement was taken), rather than always "as of right now". Use this
// anywhere you need the child's age at a specific past event.
export const ageInMonthsAt = (dob: string, atDate: string | Date): number => {
  if (!dob || !atDate) return 0;
  const birth = new Date(dob);
  const at = typeof atDate === 'string' ? new Date(atDate) : atDate;
  if (isNaN(birth.getTime()) || isNaN(at.getTime())) return 0;
  let months = (at.getFullYear() - birth.getFullYear()) * 12
    + (at.getMonth() - birth.getMonth());
  if (at.getDate() < birth.getDate()) months -= 1;
  return Math.max(0, months);
};

export const ageInWeeks = (dob: string): number => {
  if (!dob) return 0;
  const birth = new Date(dob);
  const now = new Date();
  if (isNaN(birth.getTime())) return 0;
  const diffMs = now.getTime() - birth.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)));
};

export const ageInYearsAndMonths = (dob: string): string => {
  const months = calculateAgeInMonths(dob);
  if (months < 1) return `${Math.max(0, ageInWeeks(dob))} weeks`;
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}m` : `${years} year${years === 1 ? '' : 's'}`;
};

export const daysUntil = (dateStr: string): number => {
  if (!dateStr) return 0;
  const target = new Date(dateStr);
  const now = new Date();
  if (isNaN(target.getTime())) return 0;
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const isOverdue = (dateStr: string): boolean => {
  return daysUntil(dateStr) < 0;
};

export const todayISO = (): string => new Date().toISOString().split('T')[0];

export const nowISO = (): string => new Date().toISOString();

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Aliases for older imports
export const ageInMonths = calculateAgeInMonths;
