/**
 * Translates raw backend / network error codes into user-friendly
 * messages that an end-user parent would understand. This avoids
 * showing technical terms like "ECONNABORTED", "JWT expired" or
 * "Flyway migration failed" to non-technical users.
 */

const FRIENDLY: Record<string, { en: string; sw: string }> = {
  // Auth
  INVALID_CREDENTIALS: { en: 'Email or password is incorrect. Please try again.', sw: 'Barua pepe au nenosiri si sahihi. Tafadhali jaribu tena.' },
  EMAIL_NOT_VERIFIED: { en: 'Please verify your email before signing in. Check your inbox.', sw: 'Tafadhali thibitisha barua pepe yako kabla ya kuingia. Angalia ujumbe wako.' },
  PHONE_NOT_VERIFIED: { en: 'Please verify your phone number before signing in.', sw: 'Tafadhali thibitisha nambari yako ya simu.' },
  EMAIL_TAKEN: { en: 'That email is already registered. Try signing in instead.', sw: 'Barua pepe hiyo tayari imesajiliwa. Jaribu kuingia badala yake.' },
  USER_NOT_FOUND: { en: "We couldn't find that account.", sw: 'Hukupata akaunti hiyo.' },
  UNAUTHORIZED: { en: 'Please sign in to continue.', sw: 'Tafadhali ingia ili uendelee.' },
  FORBIDDEN: { en: "You don't have permission to do that.", sw: 'Huna ruhusa ya kufanya hivyo.' },

  // Validation
  VALIDATION_ERROR: { en: 'Please check the form and try again.', sw: 'Tafadhali angalia fomu na jaribu tena.' },
  INVALID_INPUT: { en: 'Some details look incorrect. Please review and try again.', sw: 'Baadhi ya maelezo hayapo sawa. Tafadhali kagua na jaribu tena.' },

  // Children / domain
  CHILD_NOT_FOUND: { en: "We couldn't find that child. Please refresh.", sw: 'Sikupata mtoto huyo. Tafadhali onyesha upya.' },
  DOCTOR_NOT_FOUND: { en: 'That doctor is not available. Please pick another.', sw: 'Daktari huyo hayupo. Tafadhali chagua mwingine.' },
  FACILITY_NOT_FOUND: { en: "We couldn't find that health facility.", sw: 'Sikupata kituo hicho cha afya.' },

  // Network
  NETWORK_ERROR: { en: "Can't reach the server. Check your internet and try again.", sw: 'Haiwezi kufikia seva. Angalia intaneti yako na ujaribu tena.' },
  RATE_LIMITED: { en: 'You are doing that too fast. Please wait a moment and try again.', sw: 'Una fanya haraka sana. Tafadhali subiri kidogo na ujaribu tena.' },
  TIMEOUT: { en: 'The request took too long. Please try again.', sw: 'Ombi lilichukua muda mrefu. Tafadhali jaribu tena.' },
  SERVER_ERROR: { en: "Something went wrong on our end. We're working on it.", sw: 'Kuna kitu kilienda vibaya. Tunafanya kazi kurekebisha.' },

  // Catch-all
  NOT_FOUND: { en: "We couldn't find what you were looking for.", sw: 'Sikupata ulichokuwa unatafuta.' },
  CONFLICT: { en: 'That action conflicts with the current state. Please refresh and try again.', sw: 'Kitendo hicho kinapingana na hali ya sasa. Tafadhali onyesha upya.' },
};

const GENERIC = {
  en: 'Something went wrong. Please try again.',
  sw: 'Kuna kitu kilienda vibaya. Tafadhali jaribu tena.',
};

export function getErrorCode(err: any): string | undefined {
  if (!err) return undefined;
  if (err.response?.data?.errorCode) return err.response.data.errorCode;
  if (err.code === 'ECONNABORTED') return 'TIMEOUT';
  if (err.message === 'Network Error' || err.message?.startsWith('Cannot reach backend')) {
    return 'NETWORK_ERROR';
  }
  if (err.response?.status === 401) return 'UNAUTHORIZED';
  if (err.response?.status === 403) return 'FORBIDDEN';
  if (err.response?.status === 404) return 'NOT_FOUND';
  if (err.response?.status === 409) return 'CONFLICT';
  if (err.response?.status === 429) return 'RATE_LIMITED';
  if (err.response?.status >= 500) return 'SERVER_ERROR';
  return undefined;
}

export function getFriendlyError(err: any, language: 'en' | 'sw' = 'en'): string {
  const code = getErrorCode(err);
  if (code && FRIENDLY[code]) {
    return FRIENDLY[code][language] || FRIENDLY[code].en;
  }
  // Backend-provided human message wins if we have one and it's not technical
  const backendMessage = err?.response?.data?.message;
  if (backendMessage && !/^[A-Z_]+$/.test(backendMessage) && backendMessage.length < 200) {
    return backendMessage;
  }
  return GENERIC[language];
}
