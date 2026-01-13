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
 * Get all data for last N days
 */
export async function getLastNDaysData(n) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['tracker'], (result) => {
      const tracker = result.tracker || {};
      const data = {};
      
      for (let i = 0; i < n; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
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
