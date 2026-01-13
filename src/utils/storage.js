/**
 * Storage helper module for chrome.storage.local
 * Handles all data persistence operations
 */

/**
 * Get all tracked data for a specific date
 * Returns object: { domain: timeInMs, ... }
 */
export async function getDayData(dateKey) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tracker'], (result) => {
      const tracker = result.tracker || {};
      resolve(tracker[dateKey] || {});
    });
  });
}

/**
 * Add time to a domain for a specific date
 */
export async function addDomainTime(dateKey, domain, timeInMs) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tracker'], (result) => {
      const tracker = result.tracker || {};
      
      // Initialize day if not exists
      if (!tracker[dateKey]) {
        tracker[dateKey] = {};
      }
      
      // Add time to domain
      tracker[dateKey][domain] = (tracker[dateKey][domain] || 0) + timeInMs;
      
      // Save back to storage
      chrome.storage.local.set({ tracker }, () => {
        resolve(tracker[dateKey][domain]);
      });
    });
  });
}

/**
 * Get total time for all domains for a specific date
 */
export async function getDayTotalTime(dateKey) {
  const dayData = await getDayData(dateKey);
  return Object.values(dayData).reduce((sum, time) => sum + time, 0);
}

/**
 * Get all data for last N days using Indian Standard Time (IST)
 */
export async function getLastNDaysData(n) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tracker'], (result) => {
      const tracker = result.tracker || {};
      const data = {};
      
      for (let i = 0; i < n; i++) {
        const now = new Date();
        // Convert to IST (UTC+5:30)
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        istTime.setUTCDate(istTime.getUTCDate() - i);
        const year = istTime.getUTCFullYear();
        const month = String(istTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(istTime.getUTCDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        
        if (tracker[dateKey]) {
          data[dateKey] = tracker[dateKey];
        }
      }
      
      resolve(data);
    });
  });
}

/**
 * Get top N domains by time for a specific date
 */
export async function getTopDomains(dateKey, limit = 3) {
  const dayData = await getDayData(dateKey);
  const sorted = Object.entries(dayData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  return sorted.map(([domain, time]) => ({ domain, time }));
}

/**
 * Clear all data (for debugging/testing)
 */
export async function clearAllData() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['tracker'], () => {
      resolve();
    });
  });
}
