/**
 * Student Email Validation Utility
 *
 * Validates email formatting and structure.
 * Accepts all valid emails (e.g. Gmail, Outlook, Yahoo) as well as
 * campus emails (@providence.edu.in, @student.providence.edu.in).
 * 
 * Strict domain restriction can be re-enabled when official campus permission
 * is granted by setting RESTRICT_EMAIL_DOMAIN="true" in environment variables.
 */

export function validateStudentEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim().toLowerCase();
  
  if (!trimmed || !trimmed.includes('@')) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  // RFC email structure check
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email address format (e.g. name@example.com).' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, error: 'Invalid email address format.' };
  }

  // Optional future strict mode when campus permission is obtained
  if (process.env.RESTRICT_EMAIL_DOMAIN === 'true') {
    const domain = parts[1];
    const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAIN || 'student.providence.edu.in,providence.edu.in')
      .split(',')
      .map((d) => d.trim().toLowerCase().replace(/^@/, ''))
      .filter(Boolean);

    const isMatch = allowedDomains.some(
      (allowed) => domain === allowed || domain.endsWith('.' + allowed)
    );

    if (!isMatch) {
      const domainListStr = allowedDomains.map((d) => '@' + d).join(' or ');
      return {
        valid: false,
        error: `Only official campus email addresses (${domainListStr}) are permitted at this time.`,
      };
    }
  }

  // All valid emails (including personal emails like Gmail, and campus emails like providence.edu.in) are permitted
  return { valid: true };
}
