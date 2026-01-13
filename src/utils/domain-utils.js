/**
 * Extract domain from a full URL
 * Examples:
 *   https://www.youtube.com/watch?v=xyz -> youtube.com
 *   https://github.com/user/repo -> github.com
 *   http://leetcode.com/problems/1 -> leetcode.com
 */
export function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    // Remove 'www.' if present, use hostname
    let domain = urlObj.hostname;
    // For some subdomains like 'mail.google.com', keep as is or extract main domain
    // For now, we'll keep it simple and use hostname directly
    return domain || 'unknown';
  } catch (e) {
    return 'unknown';
  }
}

/**
 * Normalize domain (handle edge cases)
 * Ensures consistent domain naming
 */
export function normalizeDomain(domain) {
  if (!domain) return 'unknown';
  return domain.toLowerCase().trim();
}
