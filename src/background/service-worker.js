/**
 * Background Service Worker for Screen Time Tracker
 * 
 * TRACKING LOGIC:
 * - Listen for tab/window changes
 * - Track active tab's domain
 * - Record time spent when:
 *   - User switches to a different tab
 *   - User switches to a different window
 *   - Browser window loses focus
 *   - Service worker needs to flush (periodic)
 * - Save to chrome.storage.local immediately
 */

console.log('[Tracker] SERVICE WORKER FILE LOADING - LINE 1');

import { extractDomain, normalizeDomain } from '../utils/domain-utils.js';
import { addDomainTime } from '../utils/storage.js';
import { getTodayDateKey } from '../utils/time-utils.js';

console.log('[Tracker] IMPORTS SUCCESSFUL');

// ============ STATE MANAGEMENT ============

let trackingState = {
  currentDomain: null,
  currentTabId: null,
  currentWindowId: null,
  startTime: null, // timestamp when tracking began
  isWindowFocused: true,
};

// ============ CORE TRACKING FUNCTIONS ============

/**
 * Record time spent on a domain and update storage
 */
async function recordDomainTime(domain) {
  if (!domain || !trackingState.startTime) return;

  const elapsedTime = Date.now() - trackingState.startTime;
  
  // Record all time (even less than 1 second) to ensure accuracy
  if (elapsedTime > 0) {
    const dateKey = getTodayDateKey();
    await addDomainTime(dateKey, domain, elapsedTime);
    console.log(
      `[Tracker] Recorded ${domain}: ${elapsedTime}ms (${(elapsedTime / 1000).toFixed(2)}s) on ${dateKey}`
    );
  }
}

/**
 * Start tracking a new domain
 */
async function startTracking(domain, tabId, windowId) {
  // First, record time for previous domain (if any) - ALWAYS record before switching
  if (trackingState.currentDomain && trackingState.startTime) {
    console.log('[Tracker] Recording time for domain before switch:', trackingState.currentDomain);
    await recordDomainTime(trackingState.currentDomain);
  }

  // Update state for new domain
  const oldDomain = trackingState.currentDomain;
  trackingState.currentDomain = domain;
  trackingState.currentTabId = tabId;
  trackingState.currentWindowId = windowId;
  trackingState.startTime = Date.now();

  console.log(`[Tracker] Started tracking: ${domain} (tab: ${tabId}) | Previous: ${oldDomain}`);
}

/**
 * Stop tracking current domain (e.g., tab closed, window lost focus)
 */
async function stopTracking() {
  console.log('[Tracker] Stopping tracking for:', trackingState.currentDomain);
  
  if (trackingState.currentDomain && trackingState.startTime) {
    await recordDomainTime(trackingState.currentDomain);
  }
  
  // Reset state
  trackingState.currentDomain = null;
  trackingState.currentTabId = null;
  trackingState.startTime = null;
  
  console.log('[Tracker] Stopped tracking');
}

// ============ EVENT LISTENERS ============

/**
 * Handle when a tab becomes active
 * This is when we should start tracking the new domain
 */
console.log('[Tracker] REGISTERING onActivated listener');
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const { tabId, windowId } = activeInfo;
  
  console.log('[Tracker] *** TAB ACTIVATED *** - TabID:', tabId, 'WindowID:', windowId, 'Window focused:', trackingState.isWindowFocused);

  // Only track if window is focused
  if (!trackingState.isWindowFocused) {
    console.log('[Tracker] Tab activated but window not focused, skipping');
    return;
  }

  try {
    const tab = await chrome.tabs.get(tabId);
    console.log('[Tracker] Got tab info:', tab.url);
    
    // Verify tab has a URL and is not a chrome:// URL
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url === 'about:blank') {
      console.log('[Tracker] Skipping non-trackable URL:', tab.url);
      return;
    }

    const domain = normalizeDomain(extractDomain(tab.url));
    console.log('[Tracker] Switching to domain:', domain);
    await startTracking(domain, tabId, windowId);
  } catch (error) {
    console.error('[Tracker] Error in onActivated:', error);
  }
});

/**
 * Handle when a tab is closed
 * Record time and reset tracking if it was the active tab
 */
console.log('[Tracker] REGISTERING onRemoved listener');
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  console.log('[Tracker] *** TAB REMOVED *** - TabID:', tabId, 'Current tracked:', trackingState.currentTabId);
  // Only stop if this was our tracked tab
  if (trackingState.currentTabId === tabId) {
    console.log('[Tracker] Active tab closed, stopping tracking');
    await stopTracking();
  }
});

/**
 * Handle when tab URL changes (navigation)
 * This is important to catch domain changes within same tab
 */
console.log('[Tracker] REGISTERING onUpdated listener');
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  console.log('[Tracker] *** TAB UPDATED *** - TabID:', tabId, 'URL:', changeInfo.url);
  
  // Only care about URL changes when tab is complete and focused
  if (changeInfo.url && trackingState.currentTabId === tabId) {
    try {
      const newDomain = normalizeDomain(extractDomain(changeInfo.url));
      
      // Only update if domain actually changed
      if (newDomain !== trackingState.currentDomain) {
        await startTracking(newDomain, tabId, trackingState.currentWindowId);
      }
    } catch (error) {
      console.error('[Tracker] Error in onUpdated:', error);
    }
  }
});

/**
 * Handle when a window loses focus
 * Stop tracking the current domain
 */
console.log('[Tracker] REGISTERING onFocusChanged listener');
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  console.log('[Tracker] *** WINDOW FOCUS CHANGED *** - WindowID:', windowId);
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Window lost focus
    console.log('[Tracker] Window lost focus');
    trackingState.isWindowFocused = false;
    await stopTracking();
  } else {
    // Window gained focus
    console.log('[Tracker] Window gained focus: ' + windowId);
    trackingState.isWindowFocused = true;
    
    // Resume tracking the active tab in this window
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        windowId: windowId,
      });
      
      if (tabs.length > 0) {
        const tab = tabs[0];
        if (!tab.url || tab.url.startsWith('chrome://')) {
          return;
        }
        
        const domain = normalizeDomain(extractDomain(tab.url));
        await startTracking(domain, tab.id, windowId);
      }
    } catch (error) {
      console.error('[Tracker] Error resuming tracking on window focus:', error);
    }
  }
});

// ============ INITIALIZATION ============

/**
 * Initialize tracking when service worker starts
 * Get the currently active tab and start tracking it
 */
async function initializeTracking() {
  try {
    console.log('[Tracker] Initializing service worker...');
    
    // Get current active tab from the current window
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    console.log('[Tracker] Found tabs:', tabs.length);

    if (tabs && tabs.length > 0) {
      const tab = tabs[0];
      console.log('[Tracker] Active tab:', tab.url, 'TabID:', tab.id);
      
      if (tab.url && !tab.url.startsWith('chrome://') && tab.url !== 'about:blank') {
        const domain = normalizeDomain(extractDomain(tab.url));
        console.log('[Tracker] Starting to track domain:', domain);
        startTracking(domain, tab.id, tab.windowId);
      } else {
        console.log('[Tracker] Tab URL not trackable:', tab.url);
      }
    } else {
      console.log('[Tracker] No active tabs found');
    }
  } catch (error) {
    console.error('[Tracker] Error initializing:', error);
  }
}

// Start tracking when service worker loads
console.log('[Tracker] Service worker script loading...');
initializeTracking();

// ============ PERIODIC FLUSH (every 1 minute) ============
/**
 * Periodically save any pending tracking data
 * This ensures data isn't lost if browser closes unexpectedly
 */
setInterval(async () => {
  if (trackingState.currentDomain && trackingState.startTime) {
    // Record what we have so far, then restart the clock
    const domain = trackingState.currentDomain;
    const elapsedTime = Date.now() - trackingState.startTime;
    
    if (elapsedTime > 0) {
      const dateKey = getTodayDateKey();
      await addDomainTime(dateKey, domain, elapsedTime);
      console.log(
        `[Tracker] Periodic flush: ${domain} ${elapsedTime}ms`
      );
      
      // Restart tracking from now
      trackingState.startTime = Date.now();
    }
  }
}, 60000); // 60 seconds

console.log('[Tracker] Service worker started');
