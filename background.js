// Site Tracker Extension - background.js
// Tracks time spent on each domain and counts unique sites visited in a session.
// Now also tracks media playback time (YouTube videos, etc.) with per-tab support

let currentTabId = null;
let currentDomain = null;
let startTime = null;

// Media tracking state - now per-tab
let mediaTracking = new Map(); // tabId -> mediaState

// Helper: Extract domain from URL
function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// Helper: Get or create media state for a tab
function getMediaState(tabId) {
  if (!mediaTracking.has(tabId)) {
    mediaTracking.set(tabId, {
      isPlaying: false,
      currentMediaDomain: null,
      mediaStartTime: null,
      lastMediaUpdate: null,
      currentVideoId: null
    });
  }
  return mediaTracking.get(tabId);
}

// Helper: Update time spent on a domain
function updateTime(domain, timeSpent) {
  chrome.storage.local.get(["siteTimes", "uniqueSites"], (data) => {
    const siteTimes = data.siteTimes || {};
    const uniqueSites = data.uniqueSites || [];
    siteTimes[domain] = (siteTimes[domain] || 0) + timeSpent;
    if (!uniqueSites.includes(domain)) {
      uniqueSites.push(domain);
    }
    chrome.storage.local.set({ siteTimes, uniqueSites });
    console.log(`[Site Tracker] Updated site time for ${domain}: +${timeSpent}s`);
  });
}

// Helper: Update media playback time
function updateMediaTime(domain, timeSpent) {
  chrome.storage.local.get(["mediaTimes"], (data) => {
    const mediaTimes = data.mediaTimes || {};
    mediaTimes[domain] = (mediaTimes[domain] || 0) + timeSpent;
    chrome.storage.local.set({ mediaTimes });
    console.log(`[Site Tracker] Updated media time for ${domain}: +${timeSpent}s (total: ${mediaTimes[domain]}s)`);
  });
}

// Helper: Stop media tracking for a specific tab
function stopMediaTracking(tabId, domain) {
  const mediaState = getMediaState(tabId);
  if (mediaState.isPlaying && mediaState.currentMediaDomain === domain) {
    const elapsed = Math.floor((Date.now() - mediaState.mediaStartTime) / 1000);
    if (elapsed > 0 && elapsed < 3600) { // Max 1 hour per session to prevent errors
      updateMediaTime(domain, elapsed);
      console.log(`[Site Tracker] Stopped media tracking for tab ${tabId} on ${domain}, tracked ${elapsed}s`);
    }
    
    // Reset media tracking for this tab
    mediaState.isPlaying = false;
    mediaState.currentMediaDomain = null;
    mediaState.mediaStartTime = null;
    mediaState.lastMediaUpdate = null;
    mediaState.currentVideoId = null;
  }
}

// Handle media state updates from content scripts
function handleMediaUpdate(message, sender) {
  const { domain, isPlaying, playTime, url, videoId } = message.data;
  const tabId = sender.tab.id;
  
  console.log(`[Site Tracker] Received media update from tab ${tabId}:`, message.data);
  
  const mediaState = getMediaState(tabId);
  
  if (isPlaying && !mediaState.isPlaying) {
    // Media started playing on this tab
    mediaState.isPlaying = true;
    mediaState.currentMediaDomain = domain;
    mediaState.mediaStartTime = Date.now();
    mediaState.lastMediaUpdate = Date.now();
    mediaState.currentVideoId = videoId;
    console.log(`[Site Tracker] Media started playing on tab ${tabId} for ${domain}`);
  } else if (!isPlaying && mediaState.isPlaying && mediaState.currentMediaDomain === domain) {
    // Media stopped playing on this tab
    const elapsed = Math.floor((Date.now() - mediaState.mediaStartTime) / 1000);
    if (elapsed > 0 && elapsed < 3600) { // Max 1 hour per session
      updateMediaTime(domain, elapsed);
      console.log(`[Site Tracker] Media stopped on tab ${tabId} for ${domain}, tracked ${elapsed}s`);
    }
    
    // Reset media tracking for this tab
    mediaState.isPlaying = false;
    mediaState.currentMediaDomain = null;
    mediaState.mediaStartTime = null;
    mediaState.lastMediaUpdate = null;
    mediaState.currentVideoId = null;
  } else if (isPlaying && mediaState.isPlaying && mediaState.currentMediaDomain === domain) {
    // Update ongoing media playback on this tab
    if (mediaState.lastMediaUpdate) {
      const timeDiff = Math.floor((Date.now() - mediaState.lastMediaUpdate) / 1000);
      if (timeDiff > 0 && timeDiff < 300) { // Max 5 minutes per update to prevent errors
        updateMediaTime(domain, timeDiff);
        mediaState.lastMediaUpdate = Date.now();
      }
    }
  }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(`[Site Tracker] Received message from tab ${sender.tab?.id}:`, message);
  if (message.type === 'MEDIA_STATE_UPDATE') {
    handleMediaUpdate(message, sender);
  }
  sendResponse({ received: true });
});

// Handle tab switch or update
function handleTabChange(tabId) {
  if (currentTabId !== null && currentDomain && startTime) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    if (elapsed > 0) {
      updateTime(currentDomain, elapsed);
    }
  }
  
  // Stop media tracking for the previous tab
  if (currentTabId !== null) {
    stopMediaTracking(currentTabId, currentDomain);
  }
  
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab.url) {
      currentTabId = null;
      currentDomain = null;
      startTime = null;
      return;
    }
    currentTabId = tabId;
    currentDomain = getDomain(tab.url);
    startTime = Date.now();
    console.log(`[Site Tracker] Switched to tab: ${currentDomain}`);
  });
}

// Listen for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  handleTabChange(activeInfo.tabId);
});

// Listen for tab updates (URL change)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    handleTabChange(tabId);
  }
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  // Stop media tracking for removed tab
  const mediaState = getMediaState(tabId);
  if (mediaState.isPlaying && mediaState.currentMediaDomain) {
    stopMediaTracking(tabId, mediaState.currentMediaDomain);
  }
  
  // Remove media state for this tab
  mediaTracking.delete(tabId);
  
  // If this was the current tab, reset current state
  if (tabId === currentTabId) {
    currentTabId = null;
    currentDomain = null;
    startTime = null;
  }
  
  console.log(`[Site Tracker] Tab ${tabId} removed, cleaned up media tracking`);
});

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // All windows unfocused, stop timer
    if (currentTabId !== null && currentDomain && startTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      if (elapsed > 0) {
        updateTime(currentDomain, elapsed);
      }
    }
    
    // Stop media tracking for all tabs when window loses focus
    mediaTracking.forEach((mediaState, tabId) => {
      if (mediaState.isPlaying && mediaState.currentMediaDomain) {
        stopMediaTracking(tabId, mediaState.currentMediaDomain);
      }
    });
    
    console.log(`[Site Tracker] Window lost focus, stopped all media tracking`);
    
    currentTabId = null;
    currentDomain = null;
    startTime = null;
  } else {
    // Refocus: get active tab in this window
    chrome.windows.get(windowId, { populate: true }, (window) => {
      if (window && window.focused) {
        const activeTab = window.tabs.find((t) => t.active);
        if (activeTab) {
          handleTabChange(activeTab.id);
        }
      }
    });
  }
});

// Periodic media time update (backup for content script failures)
setInterval(() => {
  const now = Date.now();
  mediaTracking.forEach((mediaState, tabId) => {
    if (mediaState.isPlaying && mediaState.currentMediaDomain && mediaState.lastMediaUpdate) {
      const timeDiff = Math.floor((now - mediaState.lastMediaUpdate) / 1000);
      if (timeDiff > 0 && timeDiff < 300) { // Max 5 minutes per update
        updateMediaTime(mediaState.currentMediaDomain, timeDiff);
        mediaState.lastMediaUpdate = now;
      }
    }
  });
}, 15000); // Every 15 seconds instead of 10

// Helper: Set a cookie (expires in 2 days by default)
function setCookie(name, value, days = 2) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}
// Helper: Get a cookie value
function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}

// Save data to cookies as backup
function backupToCookies(siteTimes, uniqueSites, mediaTimes = {}) {
  try {
    setCookie('siteTimes', JSON.stringify(siteTimes));
    setCookie('uniqueSites', JSON.stringify(uniqueSites));
    setCookie('mediaTimes', JSON.stringify(mediaTimes));
  } catch (e) {}
}
// Restore data from cookies
function restoreFromCookies(callback) {
  try {
    const siteTimes = JSON.parse(getCookie('siteTimes') || '{}');
    const uniqueSites = JSON.parse(getCookie('uniqueSites') || '[]');
    const mediaTimes = JSON.parse(getCookie('mediaTimes') || '{}');
    callback({ siteTimes, uniqueSites, mediaTimes });
  } catch (e) {
    callback({ siteTimes: {}, uniqueSites: [], mediaTimes: {} });
  }
}

// Listen for storage changes and backup to cookies
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.siteTimes || changes.uniqueSites || changes.mediaTimes)) {
    chrome.storage.local.get(["siteTimes", "uniqueSites", "mediaTimes"], (data) => {
      backupToCookies(data.siteTimes || {}, data.uniqueSites || [], data.mediaTimes || {});
    });
  }
});

// On startup, restore from cookies if storage is empty
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["siteTimes", "uniqueSites", "mediaTimes"], (data) => {
    if (!data.siteTimes && !data.uniqueSites && !data.mediaTimes) {
      restoreFromCookies(({ siteTimes, uniqueSites, mediaTimes }) => {
        chrome.storage.local.set({ siteTimes, uniqueSites, mediaTimes });
      });
    }
  });
});

// On install, reset session data
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ siteTimes: {}, uniqueSites: [], mediaTimes: {} });
  console.log(`[Site Tracker] Extension installed, initialized storage`);
});

// Set up a chrome.alarms to clear data at midnight
function scheduleMidnightAlarm() {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const msToMidnight = nextMidnight - now;
  chrome.alarms.create('midnightReset', { when: Date.now() + msToMidnight });
}

chrome.runtime.onStartup.addListener(scheduleMidnightAlarm);
chrome.runtime.onInstalled.addListener(scheduleMidnightAlarm);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'midnightReset') {
    chrome.storage.local.set({ siteTimes: {}, uniqueSites: [], mediaTimes: {} }, () => {
      backupToCookies({}, [], {});
      scheduleMidnightAlarm();
      console.log(`[Site Tracker] Midnight reset completed`);
    });
  }
});
