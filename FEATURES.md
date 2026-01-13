# Screen Time Tracker - Complete Feature Guide

## Overview
A Chrome extension that accurately tracks your browser usage with an elegant dark-themed popup interface showing real-time statistics and 7-day analytics.

---

## Core Features

### 1. **Active Tab Tracking**
- ✅ Tracks **only the active/focused tab** in real-time
- ✅ Automatically pauses when:
  - You switch to another tab
  - You switch to another browser window
  - Browser window loses focus (you switch to another app)
- ✅ Resumes tracking when you return to the browser
- ✅ Works with any website except Chrome system pages (chrome://, about:blank)

**About Split-Screen Tabs:**
- When you open two tabs side-by-side in split view, only ONE is considered the "active" tab by Chrome
- The extension tracks whichever tab is currently active (has focus)
- This is a Chrome limitation - the extension can only see one active tab at a time
- Recommendation: Click between the two tabs to ensure both get tracked time

---

### 2. **Accurate Time Recording**
- ✅ Records time in **milliseconds** precision
- ✅ Every second is captured, even partial seconds
- ✅ Periodic auto-save every **30 seconds** to prevent data loss
- ✅ Works during extended browsing sessions (1 hour+, multiple hours)
- ✅ Data persists even after browser restart

---

### 3. **Three Popup Views**

#### **Compact View** (Default)
- Total time spent today
- Top 3 websites with their time
- Current date and day display
- Button to expand for more details

#### **Today View**
- All websites visited today
- Sorted by time (most-used first)
- Category labels (Entertainment, Productivity, Social Media, etc.)
- Exact time spent on each

#### **Categories View**
- Time grouped by category type
- See how much time in Entertainment vs Productivity
- Helps identify usage patterns
- 100+ domains pre-categorized

#### **Last 7 Days View**
- **Visual bar graph** showing daily usage
- **Clear visual distinctions:**
  - Bar **height** represents time (taller = more time)
  - Bar **color intensity** represents time (darker = more time)
  - Uses non-linear scaling so small differences appear visually distinct
  - Even if Tuesday is 5 minutes more than Monday, you'll see a clear difference
- Daily breakdown list below the graph
- Shows each day's total time

---

## Visual Features

### **Dark Professional Theme**
- Pure black background (#0d0d0d)
- Neutral grays for hierarchy
- White text for readability
- No blue accents - clean minimalist design

### **Graph Visualization**
- **Height scaling:** Non-linear formula makes small differences visible
- **Color intensity:** Darker shades = more time spent
- **Example:**
  - 30 min: Light gray, short bar
  - 1 hour: Medium gray, medium bar
  - 2 hours: Dark gray, tall bar
  - **All clearly visually distinct**
- Hover effects with shadow enhancement
- Smooth transitions and animations
- Tooltip with full date, day, and time details

### **Interactive Elements**
- Hover effects on all cards and buttons
- Smooth transitions
- Button press feedback (lift effect)
- Shadow depth on all interactive elements

---

## Technical Details

### **Storage**
- ✅ Uses Chrome's `chrome.storage.local` (local-only, survives restart)
- ✅ Data structure: `tracker[YYYY-MM-DD][domain] = time_in_milliseconds`
- ✅ All data stays on your computer, nothing sent to cloud

### **Timezone Support**
- ✅ Indian Standard Time (IST/UTC+5:30)
- ✅ Automatic date rollover at midnight IST
- ✅ Accurate for India-based users

### **Category Mapping**
- ✅ 100+ domains pre-categorized:
  - **Entertainment:** reddit.com, youtube.com, netflix.com, etc.
  - **Productivity:** github.com, stackoverflow.com, trello.com, etc.
  - **Social Media:** twitter.com, instagram.com, facebook.com, etc.
  - **Work:** gmail.com, slack.com, teams.microsoft.com, etc.
  - **News:** bbc.com, cnn.com, medium.com, etc.
- ✅ Custom categories can be added by editing `src/utils/categories.js`

---

## How It Works

### **Tracking Flow**
```
1. You click a tab → Extension detects active tab change
2. Records time from previous tab (if any)
3. Starts tracking the new domain
4. Every 30 seconds → Auto-saves accumulated time
5. When you switch tabs/windows/app → Records and pauses
6. When you return → Resumes tracking from that point
```

### **Data Accuracy**
- No 1-second minimum - captures all time
- Awaits all async recording operations
- Atomic transactions to storage
- 30-second periodic flush ensures no data loss
- Service worker keep-alive prevents suspension

---

## Usage Examples

### **Example 1: Daily Tracking**
1. Open extension (compact view)
2. See total time today
3. See top 3 sites visited
4. Click "View Details" for full list

### **Example 2: Weekly Analysis**
1. Click "Last 7 Days" tab
2. **Visual bar graph** shows usage by day
3. Bars clearly show which days you used browser more
4. List below shows breakdown for each day

### **Example 3: Category Analysis**
1. Click "Categories" tab
2. See time by type (Productivity vs Entertainment)
3. Identify where most time is spent
4. Understand usage patterns

---

## Tips & Tricks

### **For Accurate Tracking**
1. Keep browser window focused while browsing
2. Extension doesn't track when Chrome window is in background
3. Switching to other apps pauses tracking (as intended)
4. Switching between Chrome tabs is tracked automatically

### **For Better Insights**
1. Check "Last 7 Days" view to spot patterns
2. Use "Categories" to see productivity vs entertainment breakdown
3. Review daily trends to understand your browsing habits
4. Data persists indefinitely (until you clear it)

### **Clear Data (If Needed)**
- Click "Clear All Data" button in expanded view
- This removes all tracking history
- Cannot be undone - only do this if necessary

---

## What's NOT Tracked

❌ Background tabs (only active/focused tab)
❌ Other browser windows' usage
❌ Time when Chrome is not in focus
❌ Chrome system pages (chrome://*, about:blank)
❌ Private/Incognito browsing (Chrome limitation)
❌ Data is not sent anywhere (100% local)

---

## Version History

- **v2.5** - Graph Enhancement: Fixed color generation with HSL gradients, improved visual distinctions
- **v2.4** - Improved long-session tracking (30s flush), non-linear graph scaling
- **v2.3** - Critical tracking accuracy fixes, removed 1s threshold
- **v2.2** - Professional UI polish with shadows and gradients
- **v2.1** - Black theme redesign, tracking logic improvements
- **v2.0** - Dark theme implementation
- **v1.0** - Core tracking functionality

---

## Troubleshooting

### **Tracking seems low**
- Make sure Chrome window is in focus
- Check if tabs are actually active (some auto-close)
- Verify data by opening popup and checking "Today" view

### **Graph bars look the same**
- If you have similar usage on different days, they might be close in height
- Non-linear scaling makes small differences visible
- Hover over bars to see exact time in tooltip

### **Data disappeared**
- Refresh the popup (close and reopen)
- Check if you accidentally clicked "Clear All Data"
- Check "Today" view to see if today's data is there
- Previous days' data is preserved in 7-day history

### **Extension not tracking**
1. Verify extension is enabled: `chrome://extensions`
2. Check if the service worker is active
3. Try reloading the extension
4. Reload the browser tab you're visiting

---

## Privacy & Security

✅ **100% Private:** All data stored locally on your computer
✅ **No Cloud:** Nothing is sent to servers
✅ **No Tracking ID:** Uses local chrome.storage.local only
✅ **No Permissions Abuse:** Only needs tabs/storage permissions for tracking
✅ **Open Source:** Code is transparent and auditable

---

## Frequently Asked Questions

**Q: Does it work with multiple accounts?**
A: Data is account-specific (per Chrome profile)

**Q: Can I export my data?**
A: Currently stored in chrome.storage.local; can be accessed via Chrome DevTools

**Q: Does it work in Incognito mode?**
A: No, Chrome blocks extension storage in Incognito by default

**Q: Can I track multiple browsers?**
A: This extension only tracks Chrome; use separate instances for other browsers

**Q: Is there a cloud sync?**
A: No, data stays local only. Each Chrome profile has separate data.

---

## Support

For issues or feature requests, check the extension logs:
1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Inspect views" on the extension
4. Check the service worker console for logs

All logs include `[Tracker]` prefix for easy filtering.
