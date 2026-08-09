/**
 * Parse a user-entered date string into YYYY-MM-DD.
 * Accepts: "2024-01-15", "2024/01/15", "15-01-2024", "15/01/2024", "Jan 15 2024"
 */
export const parseDate = (input: string): string | null => {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  let m = trimmed.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;

  m = trimmed.match(/^(\d{1,2})[\-\/](\d{1,2})[\-\/](\d{4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const mon = parseInt(m[2], 10);
    const year = parseInt(m[3], 10);
    if (day >= 1 && day <= 31 && mon >= 1 && mon <= 12 && year > 1900) {
      return `${year}-${String(mon).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  return null;
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return /^\+?[\d\s\-\(\)]{7,20}$/.test(phone);
};

export const isStrongPassword = (password: string): boolean => {
  return password.length >= 8 && password.length <= 100;
};
