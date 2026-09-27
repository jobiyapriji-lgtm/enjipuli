/**
 * College Email Validation Utility
 *
 * Ensures only authorized campus students can log in.
 * Blocks public consumer domains (gmail, yahoo, etc.) and
 * verifies the email domain against configured campus domains.
 */

export const PUBLIC_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'zoho.com',
  'mail.com',
  'yandex.com',
  'live.com',
];

export function getAllowedCollegeDomains(): string[] {
  const envDomains =
    process.env.ALLOWED_EMAIL_DOMAIN?.trim() ||
    'student.providence.edu.in,providence.edu.in';
  return envDomains
    .split(',')
    .map((d) => d.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean);
}

export function validateStudentEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim().toLowerCase();
  
  if (!trimmed || !trimmed.includes('@')) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  // Basic RFC email structure check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email address format.' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid email address format.' };
  }

  const domain = parts[1];

  // Explicit block for public outsider domains
  if (PUBLIC_EMAIL_DOMAINS.includes(domain)) {
    const allowed = getAllowedCollegeDomains();
    return {
      valid: false,
      error: `Outsider access restricted: Personal email accounts (@${domain}) are not permitted. Please use your official college email address (@${allowed[0] || 'college.ac.in'}).`,
    };
  }

  const allowedDomains = getAllowedCollegeDomains();
  // Check if domain matches or is a subdomain of an allowed domain (e.g. cse.college.ac.in)
  const isMatch = allowedDomains.some(
    (allowed) => domain === allowed || domain.endsWith('.' + allowed)
  );

  if (!isMatch) {
    const domainListStr = allowedDomains.map((d) => `@${d}`).join(' or ');
    return {
      valid: false,
      error: `Outsider access restricted: Only verified students with a ${domainListStr} email can access this app.`,
    };
  }

  return { valid: true };
}
