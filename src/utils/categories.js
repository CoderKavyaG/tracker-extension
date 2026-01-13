/**
 * Domain to Category mapping
 * Edit this object to add/remove/update category assignments
 */
const DOMAIN_CATEGORIES = {
  // Entertainment
  'youtube.com': 'Entertainment',
  'netflix.com': 'Entertainment',
  'twitch.tv': 'Entertainment',
  'reddit.com': 'Entertainment',
  'tiktok.com': 'Entertainment',
  'hulu.com': 'Entertainment',
  'disneyplus.com': 'Entertainment',
  'primevideo.com': 'Entertainment',
  'spotify.com': 'Entertainment',
  'soundcloud.com': 'Entertainment',
  'instagram.com': 'Entertainment',
  'twitter.com': 'Entertainment',
  'x.com': 'Entertainment',
  'facebook.com': 'Entertainment',
  'pinterest.com': 'Entertainment',
  'imgur.com': 'Entertainment',

  // Learning
  'leetcode.com': 'Learning',
  'github.com': 'Learning',
  'stackoverflow.com': 'Learning',
  'coursera.org': 'Learning',
  'udemy.com': 'Learning',
  'khanacademy.org': 'Learning',
  'edx.org': 'Learning',
  'codecademy.com': 'Learning',
  'hackerrank.com': 'Learning',
  'medium.com': 'Learning',
  'dev.to': 'Learning',
  'w3schools.com': 'Learning',
  'mdn.io': 'Learning',
  'mozilla.org': 'Learning',
  'python.org': 'Learning',
  'docs.python.org': 'Learning',
  'docker.com': 'Learning',
  'kubernetes.io': 'Learning',
  'openai.com': 'Learning',

  // Social
  'linkedin.com': 'Social',
  'telegram.org': 'Social',
  'whatsapp.com': 'Social',
  'discord.com': 'Social',
  'slack.com': 'Social',

  // Productivity
  'gmail.com': 'Productivity',
  'google.com': 'Productivity',
  'docs.google.com': 'Productivity',
  'sheets.google.com': 'Productivity',
  'slides.google.com': 'Productivity',
  'notion.so': 'Productivity',
  'trello.com': 'Productivity',
  'asana.com': 'Productivity',
  'microsoft.com': 'Productivity',
  'office.com': 'Productivity',
  'dropbox.com': 'Productivity',
  'drive.google.com': 'Productivity',

  // News
  'bbc.com': 'News',
  'cnn.com': 'News',
  'nytimes.com': 'News',
  'bbc.co.uk': 'News',
  'theguardian.com': 'News',
  'reuters.com': 'News',
  'apnews.com': 'News',

  // Shopping
  'amazon.com': 'Shopping',
  'ebay.com': 'Shopping',
  'aliexpress.com': 'Shopping',
  'flipkart.com': 'Shopping',
};

/**
 * Get category for a domain
 * Returns 'Other' if domain not found in mapping
 */
export function getCategoryForDomain(domain) {
  // Normalize domain (remove www., lowercase)
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
  return DOMAIN_CATEGORIES[normalizedDomain] || 'Other';
}

/**
 * Get all categories with their domain counts
 */
export function getAllCategories() {
  return Object.values(DOMAIN_CATEGORIES).reduce((acc, category) => {
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Add or update category for a domain
 */
export function setDomainCategory(domain, category) {
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
  DOMAIN_CATEGORIES[normalizedDomain] = category;
}

/**
 * Get all domains in a specific category
 */
export function getDomainsInCategory(category) {
  return Object.entries(DOMAIN_CATEGORIES)
    .filter(([_, cat]) => cat === category)
    .map(([domain, _]) => domain);
}
