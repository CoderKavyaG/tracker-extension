/**
 * Popup UI Logic for Screen Time Tracker
 * Handles display of tracking data and user interactions
 */

import {
  getDayData,
  getDayTotalTime,
  getLastNDaysData,
  getTopDomains,
  clearAllData,
} from '../utils/storage.js';
import {
  formatTime,
  formatTimeShort,
  getTodayDateKey,
  getDateKeyNDaysAgo,
  formatDateKey,
} from '../utils/time-utils.js';
import { getCategoryForDomain } from '../utils/categories.js';

// ============ STATE ============

let currentView = 'compact'; // 'compact' or 'expanded'

// ============ DOM ELEMENTS ============

const loadingState = document.getElementById('loadingState');
const compactView = document.getElementById('compactView');
const expandedView = document.getElementById('expandedView');

// Compact view
const compactTotalTime = document.getElementById('compactTotalTime');
const compactTopDomains = document.getElementById('compactTopDomains');
const expandBtn = document.getElementById('expandBtn');
const viewDetailsBtn = document.getElementById('viewDetailsBtn');

// Expanded view
const backBtn = document.getElementById('backBtn');
const allDomainsToday = document.getElementById('allDomainsToday');
const categoryBreakdown = document.getElementById('categoryBreakdown');
const last7Days = document.getElementById('last7Days');
const graphBars = document.getElementById('graphBars');
const dateDisplay = document.getElementById('dateDisplay');
const dayDisplay = document.getElementById('dayDisplay');
const dateDisplayCompact = document.getElementById('dateDisplayCompact');
const dayDisplayCompact = document.getElementById('dayDisplayCompact');
const clearDataBtn = document.getElementById('clearDataBtn');

// Tabs
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// ============ HELPER FUNCTIONS ============

/**
 * Show loading state
 */
function showLoading() {
  loadingState.classList.remove('hidden');
  compactView.classList.add('hidden');
  expandedView.classList.add('hidden');
}

/**
 * Show compact view
 */
function showCompactView() {
  currentView = 'compact';
  loadingState.classList.add('hidden');
  compactView.classList.remove('hidden');
  expandedView.classList.add('hidden');
}

/**
 * Show expanded view
 */
function showExpandedView() {
  currentView = 'expanded';
  loadingState.classList.add('hidden');
  compactView.classList.add('hidden');
  expandedView.classList.remove('hidden');
}

/**
 * Format domain name (remove www., truncate if needed)
 */
function formatDomainName(domain) {
  let formatted = domain.replace(/^www\./, '');
  // Truncate if too long
  if (formatted.length > 25) {
    return formatted.substring(0, 22) + '...';
  }
  return formatted;
}

/**
 * Create domain item element
 */
function createDomainItem(domain, time, includeCategory = false) {
  const item = document.createElement('div');
  item.className = includeCategory ? 'domain-item-full' : 'domain-item';
  
  if (includeCategory) {
    const info = document.createElement('div');
    info.className = 'domain-info';
    
    const name = document.createElement('div');
    name.className = 'domain-name-full';
    name.textContent = formatDomainName(domain);
    
    const category = document.createElement('div');
    category.className = 'domain-category';
    category.textContent = getCategoryForDomain(domain);
    
    info.appendChild(name);
    info.appendChild(category);
    item.appendChild(info);
  } else {
    const name = document.createElement('div');
    name.className = 'domain-name';
    name.textContent = formatDomainName(domain);
    item.appendChild(name);
  }
  
  const timeEl = document.createElement('div');
  timeEl.className = includeCategory ? 'domain-time-full' : 'domain-time';
  timeEl.textContent = formatTimeShort(time);
  item.appendChild(timeEl);
  
  return item;
}

/**
 * Create empty state element
 */
function createEmptyState() {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.innerHTML = '<p class="empty-state-text">No data yet. Keep browsing!</p>';
  return div;
}

/**
 * Get day of week abbreviation (Mon, Tue, etc)
 */
function getDayOfWeek(dateKey) {
  const [year, month, day] = dateKey.split('-');
  const date = new Date(year, parseInt(month) - 1, parseInt(day));
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

/**
 * Update date header with today's date and day
 */
function updateDateHeader() {
  const today = getTodayDateKey();
  const [year, month, day] = today.split('-');
  const date = new Date(year, parseInt(month) - 1, parseInt(day));
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dateStr = `${months[date.getMonth()]} ${day}, ${year}`;
  const dayStr = `(${days[date.getDay()]})`;
  
  // Update expanded view
  dateDisplay.textContent = dateStr;
  dayDisplay.textContent = dayStr;
  
  // Update compact view
  dateDisplayCompact.textContent = dateStr;
  dayDisplayCompact.textContent = dayStr;
}

// ============ UPDATE FUNCTIONS ============

/**
 * Update compact view with today's data
 */
async function updateCompactView() {
  try {
    const dateKey = getTodayDateKey();
    console.log('[Popup] Fetching data for date:', dateKey);
    
    const totalTime = await getDayTotalTime(dateKey);
    const topDomains = await getTopDomains(dateKey, 3);

    console.log('[Popup] Total time:', totalTime, 'Top domains:', topDomains);

    // Update total time
    compactTotalTime.textContent = formatTime(totalTime);

    // Update top domains
    compactTopDomains.innerHTML = '';
    if (topDomains.length === 0) {
      compactTopDomains.appendChild(createEmptyState());
    } else {
      topDomains.forEach(({ domain, time }) => {
        console.log('[Popup] Adding domain:', domain, 'time:', formatTimeShort(time));
        compactTopDomains.appendChild(createDomainItem(domain, time));
      });
    }
  } catch (error) {
    console.error('Error updating compact view:', error);
  }
}

/**
 * Update expanded view - today's tab
 */
async function updateTodayContent() {
  try {
    const dateKey = getTodayDateKey();
    const dayData = await getDayData(dateKey);
    const sortedDomains = Object.entries(dayData)
      .sort((a, b) => b[1] - a[1]);

    allDomainsToday.innerHTML = '';
    if (sortedDomains.length === 0) {
      allDomainsToday.appendChild(createEmptyState());
    } else {
      sortedDomains.forEach(([domain, time]) => {
        allDomainsToday.appendChild(createDomainItem(domain, time, true));
      });
    }
  } catch (error) {
    console.error('Error updating today content:', error);
  }
}

/**
 * Update expanded view - category tab
 */
async function updateCategoryContent() {
  console.log('[Popup] ===== CATEGORY UPDATE STARTING =====');
  try {
    const dateKey = getTodayDateKey();
    console.log('[Popup] Category - Today dateKey:', dateKey);
    const dayData = await getDayData(dateKey);
    
    console.log('[Popup] Category - Day data:', dayData);
    console.log('[Popup] Category - Day data keys:', Object.keys(dayData));
    console.log('[Popup] Category - Day data entries:', Object.entries(dayData));

    // Group by category
    const categoryData = {};
    Object.entries(dayData).forEach(([domain, time]) => {
      const category = getCategoryForDomain(domain);
      console.log('[Popup] Category - Domain:', domain, 'Category:', category, 'Time:', time);
      categoryData[category] = (categoryData[category] || 0) + time;
    });

    console.log('[Popup] Category - Grouped data:', categoryData);

    // Sort by time
    const sorted = Object.entries(categoryData)
      .sort((a, b) => b[1] - a[1]);

    console.log('[Popup] Category - Sorted:', sorted);

    categoryBreakdown.innerHTML = '';
    if (sorted.length === 0) {
      console.log('[Popup] Category - No data, showing empty state');
      categoryBreakdown.appendChild(createEmptyState());
    } else {
      sorted.forEach(([category, time]) => {
        console.log('[Popup] Adding category item:', category, formatTime(time));
        const item = document.createElement('div');
        item.className = 'category-item';
        
        const name = document.createElement('div');
        name.className = 'category-name';
        name.textContent = category;
        
        const timeEl = document.createElement('div');
        timeEl.className = 'category-time';
        timeEl.textContent = formatTime(time);
        
        item.appendChild(name);
        item.appendChild(timeEl);
        categoryBreakdown.appendChild(item);
      });
    }
  } catch (error) {
    console.error('Error updating category content:', error);
  }
}

/**
 * Update expanded view - last 7 days tab
 */
async function updateLast7DaysContent() {
  try {
    const last7Data = await getLastNDaysData(7);
    console.log('[Popup] Last7Days - Full data:', last7Data);

    // Generate data for each of the last 7 days
    const dayEntries = [];
    for (let i = 0; i < 7; i++) {
      const dateKey = getDateKeyNDaysAgo(i);
      const dayData = last7Data[dateKey] || {};
      const dayTime = Object.values(dayData).reduce((sum, time) => sum + time, 0);
      console.log('[Popup] Last7Days - Date:', dateKey, 'Data:', dayData, 'Total:', dayTime);
      dayEntries.push({ dateKey, time: dayTime });
    }

    // Reverse so most recent is on the right
    dayEntries.reverse();

    // Update graph
    console.log('[Popup] Last7Days - Day entries:', dayEntries);
    if (dayEntries.every(e => e.time === 0)) {
      console.log('[Popup] Last7Days - No data, showing empty state');
      graphBars.innerHTML = '<div class="empty-state"><p class="empty-state-text">No data yet. Keep browsing!</p></div>';
    } else {
      const maxTime = Math.max(...dayEntries.map(e => e.time), 1);
      console.log('[Popup] Last7Days - Max time:', maxTime, 'milliseconds');
      graphBars.innerHTML = dayEntries.map(({ dateKey, time }, index) => {
        // Use square root scaling for DRAMATIC visual distinction
        // This makes smaller values appear much more distinct
        const sqrtRatio = Math.sqrt(time / maxTime);
        const percentage = Math.max((sqrtRatio * 85), 2); // 2% min, 85% max to prevent overflow
        const isToday = dateKey === getTodayDateKey();
        const dayOfWeek = getDayOfWeek(dateKey);
        
        // Generate distinct colors based on time intensity
        // Lower time = lighter gray, Higher time = darker gray
        const intensity = time / maxTime; // 0 to 1
        const lightness = Math.round(50 - (intensity * 30)); // 50% to 20% (darker as time increases)
        const barGradient = `linear-gradient(180deg, hsl(0, 0%, ${lightness + 12}%) 0%, hsl(0, 0%, ${lightness - 8}%) 100%)`;
        
        return `
          <div class="graph-bar">
            <div class="bar-time">${formatTimeShort(time)}</div>
            <div class="bar-column" style="height: ${percentage}%;" data-height="${percentage}" title="Day: ${dayOfWeek}\nDate: ${dateKey}\nTime: ${formatTime(time)}"></div>
            <div class="bar-label">${dayOfWeek}</div>
          </div>
        `;
      }).join('');
    }

    // Update list
    last7Days.innerHTML = '';
    if (dayEntries.every(e => e.time === 0)) {
      last7Days.appendChild(createEmptyState());
    } else {
      // Reverse again for display (most recent first)
      dayEntries.reverse();
      dayEntries.forEach(({ dateKey, time }) => {
        const item = document.createElement('div');
        item.className = 'day-item';
        
        const label = document.createElement('div');
        label.className = 'day-label';
        const isToday = dateKey === getTodayDateKey();
        label.textContent = isToday ? 'Today' : formatDateKey(dateKey);
        
        const timeEl = document.createElement('div');
        timeEl.className = 'day-time';
        timeEl.textContent = formatTime(time);
        
        item.appendChild(label);
        item.appendChild(timeEl);
        last7Days.appendChild(item);
      });
    }
  } catch (error) {
    console.error('Error updating last 7 days content:', error);
  }
}

/**
 * Update all views
 */
async function updateAllViews() {
  showLoading();
  try {
    console.log('[Popup] Updating all views...');
    updateDateHeader();
    await Promise.all([
      updateCompactView(),
      updateTodayContent(),
      updateCategoryContent(),
      updateLast7DaysContent(),
    ]);
    console.log('[Popup] Views updated successfully');
    showCompactView();
  } catch (error) {
    console.error('Error updating views:', error);
  }
}

// ============ EVENT LISTENERS ============

/**
 * Toggle between compact and expanded views
 */
expandBtn.addEventListener('click', showExpandedView);
viewDetailsBtn.addEventListener('click', showExpandedView);
backBtn.addEventListener('click', () => {
  updateCompactView(); // Refresh compact view data
  showCompactView();
});

/**
 * Tab switching
 */
tabs.forEach(tab => {
  tab.addEventListener('click', async () => {
    // Update active tab
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Update content visibility
    const tabName = tab.getAttribute('data-tab');
    tabContents.forEach(content => {
      content.classList.remove('active');
    });

    if (tabName === 'today') {
      document.getElementById('todayContent').classList.add('active');
      await updateTodayContent();
    } else if (tabName === 'category') {
      document.getElementById('categoryContent').classList.add('active');
      await updateCategoryContent();
    } else if (tabName === 'week') {
      document.getElementById('weekContent').classList.add('active');
      await updateLast7DaysContent();
    }
  });
});

/**
 * Clear data button
 */
clearDataBtn.addEventListener('click', async () => {
  if (confirm('Are you sure? This will delete all tracked data.')) {
    await clearAllData();
    await updateAllViews();
  }
});

// ============ AUTO-REFRESH ============

/**
 * Refresh data every 1 second when popup is open
 * This ensures we see live updates
 */
let refreshInterval;

function startAutoRefresh() {
  // Clear any existing interval first
  if (refreshInterval) clearInterval(refreshInterval);
  
  refreshInterval = setInterval(async () => {
    try {
      updateDateHeader();
      if (currentView === 'compact') {
        await updateCompactView();
      } else {
        // Update the currently active tab content
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
          const tabName = activeTab.getAttribute('data-tab');
          if (tabName === 'today') {
            await updateTodayContent();
          } else if (tabName === 'category') {
            await updateCategoryContent();
          } else if (tabName === 'week') {
            await updateLast7DaysContent();
          }
        }
      }
    } catch (error) {
      console.error('[Popup] Auto-refresh error:', error);
    }
  }, 1000); // Refresh every 1 second for live updates
}

/**
 * Clear interval when popup closes
 */
window.addEventListener('unload', () => {
  if (refreshInterval) clearInterval(refreshInterval);
});

// ============ INITIALIZATION ============

// Load data on popup open
console.log('[Popup] Popup script loaded, initializing...');
updateAllViews();
startAutoRefresh();
