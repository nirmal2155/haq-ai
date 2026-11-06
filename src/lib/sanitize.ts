/**
 * Safe text sanitization utilities to prevent XSS, HTML injection,
 * and dangerous markup execution.
 */

export function sanitizeText(input: unknown, maxLength = 10000): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Prevent resource exhaustion from oversized payload strings
  const bounded = input.length > maxLength ? input.slice(0, maxLength) : input;

  return bounded
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strips script tags, raw HTML tags, and event handlers
 * while preserving readable multiline plain text.
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}
