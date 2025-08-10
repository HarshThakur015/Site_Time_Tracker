// content.js
// Detects media playback and sends updates to background script
// Enhanced with per-tab tracking and better event handling

let mediaState = {
  isPlaying: false,
  startTime: null,
  totalPlayTime: 0,
  lastUpdate: Date.now(),
  currentVideoId: null
};

let mediaElements = [];
let observer = null;
let eventListeners = new Map(); // Track event listeners for cleanup
let periodicUpdateInterval = null;

// Detect if we're on YouTube
function isYouTube() {
  return window.location.hostname === 'www.youtube.com' || 
         window.location.hostname === 'youtube.com' ||
         window.location.hostname === 'm.youtube.com';
}

// Generate unique video ID for tracking
function getVideoId(video) {
  // Try to get YouTube video ID from various sources
  if (video.src && video.src.includes('youtube.com')) {
    const urlParams = new URLSearchParams(video.src.split('?')[1]);
    return urlParams.get('v') || `video_${Date.now()}_${Math.random()}`;
  }
  
  // Fallback to video element properties
  if (video.dataset.videoId) {
    return video.dataset.videoId;
  }
  
  // Generate unique ID based on video properties
  return `video_${video.currentTime || 0}_${video.duration || 0}_${Date.now()}`;
}

// Find video elements on the page
function findVideoElements() {
  const videos = document.querySelectorAll('video');
  const iframes = document.querySelectorAll('iframe[src*="youtube.com"]');
  
  // Clear old event listeners before adding new ones
  clearEventListeners();
  
  mediaElements = [...videos];
  
  // Also check for YouTube iframes
  iframes.forEach(iframe => {
    try {
      if (iframe.contentDocument) {
        const iframeVideos = iframe.contentDocument.querySelectorAll('video');
        mediaElements.push(...iframeVideos);
      }
    } catch (e) {
      // Cross-origin iframe, can't access content
    }
  });
  
  // Filter out invalid video elements
  mediaElements = mediaElements.filter(video => {
    try {
      // Check if video element is valid and has required properties
      return video && 
             video.tagName === 'VIDEO' && 
             video.readyState !== undefined &&
             video.duration !== undefined &&
             video.duration > 0;
    } catch (e) {
      console.log(`[Site Tracker] Invalid video element:`, e);
      return false;
    }
  });
  
  console.log(`[Site Tracker] Found ${mediaElements.length} valid video elements on ${window.location.hostname}`);
  return mediaElements;
}

// Clear all event listeners to prevent memory leaks
function clearEventListeners() {
  eventListeners.forEach((listeners, video) => {
    listeners.forEach(({ event, handler }) => {
      video.removeEventListener(event, handler);
    });
  });
  eventListeners.clear();
}

// Monitor video state changes
function setupVideoMonitoring() {
  mediaElements.forEach(video => {
    try {
      const videoId = getVideoId(video);
      const listeners = [];
      
      // Play event
      const playHandler = () => {
        try {
          console.log(`[Site Tracker] Video ${videoId} started playing on ${window.location.hostname}`);
          if (!mediaState.isPlaying) {
            mediaState.isPlaying = true;
            mediaState.startTime = Date.now();
            mediaState.lastUpdate = Date.now();
            mediaState.currentVideoId = videoId;
            sendMediaUpdate();
          }
        } catch (e) {
          console.error(`[Site Tracker] Error in play handler:`, e);
        }
      };
      video.addEventListener('play', playHandler);
      listeners.push({ event: 'play', handler: playHandler });
      
      // Pause event
      const pauseHandler = () => {
        try {
          console.log(`[Site Tracker] Video ${videoId} paused on ${window.location.hostname}`);
          if (mediaState.isPlaying && mediaState.currentVideoId === videoId) {
            updatePlayTime();
            mediaState.isPlaying = false;
            mediaState.currentVideoId = null;
            sendMediaUpdate();
          }
        } catch (e) {
          console.error(`[Site Tracker] Error in pause handler:`, e);
        }
      };
      video.addEventListener('pause', pauseHandler);
      listeners.push({ event: 'pause', handler: pauseHandler });
      
      // Ended event
      const endedHandler = () => {
        try {
          console.log(`[Site Tracker] Video ${videoId} ended on ${window.location.hostname}`);
          if (mediaState.isPlaying && mediaState.currentVideoId === videoId) {
            updatePlayTime();
            mediaState.isPlaying = false;
            mediaState.currentVideoId = null;
            sendMediaUpdate();
          }
        } catch (e) {
          console.error(`[Site Tracker] Error in ended handler:`, e);
        }
      };
      video.addEventListener('ended', endedHandler);
      listeners.push({ event: 'ended', handler: endedHandler });
      
      // Time update (for more accurate tracking) - throttled
      let lastTimeUpdate = 0;
      const timeUpdateHandler = () => {
        try {
          const now = Date.now();
          // Only update every 2 seconds to avoid excessive calls
          if (now - lastTimeUpdate > 2000) {
            if (mediaState.isPlaying && mediaState.currentVideoId === videoId) {
              updatePlayTime();
              lastTimeUpdate = now;
            }
          }
        } catch (e) {
          console.error(`[Site Tracker] Error in timeupdate handler:`, e);
        }
      };
      video.addEventListener('timeupdate', timeUpdateHandler);
      listeners.push({ event: 'timeupdate', handler: timeUpdateHandler });
      
      // Handle seeking (user jumps to different part of video)
      const seekedHandler = () => {
        try {
          if (mediaState.isPlaying && mediaState.currentVideoId === videoId) {
            console.log(`[Site Tracker] Video ${videoId} seeked to ${video.currentTime}s`);
            // Reset last update to prevent time calculation errors
            mediaState.lastUpdate = Date.now();
          }
        } catch (e) {
          console.error(`[Site Tracker] Error in seeked handler:`, e);
        }
      };
      video.addEventListener('seeked', seekedHandler);
      listeners.push({ event: 'seeked', handler: seekedHandler });
      
      // Handle waiting (video buffering)
      const waitingHandler = () => {
        try {
          if (mediaState.isPlaying && mediaState.currentVideoId === videoId) {
            console.log(`[Site Tracker] Video ${videoId} is buffering...`);
            // Don't stop tracking, just log the event
          }
        } catch (e) {
          console.error(`[Site Tracker] Error in waiting handler:`, e);
        }
      };
      video.addEventListener('waiting', waitingHandler);
      listeners.push({ event: 'waiting', handler: waitingHandler });
      
      // Handle canplay (video ready to play after buffering)
      const canplayHandler = () => {
        try {
          if (mediaState.isPlaying && mediaState.currentVideoId === videoId) {
            console.log(`[Site Tracker] Video ${videoId} ready to play after buffering`);
            // Reset last update to prevent time calculation errors
            mediaState.lastUpdate = Date.now();
          }
        } catch (e) {
          console.error(`[Site Tracker] Error in canplay handler:`, e);
        }
      };
      video.addEventListener('canplay', canplayHandler);
      listeners.push({ event: 'canplay', handler: canplayHandler });
      
      // Handle rate change (playback speed changes)
      const ratechangeHandler = () => {
        try {
          if (mediaState.isPlaying && mediaState.currentVideoId === videoId) {
            console.log(`[Site Tracker] Video ${videoId} playback rate changed to ${video.playbackRate}x`);
            // Reset last update to prevent time calculation errors
            mediaState.lastUpdate = Date.now();
          }
        } catch (e) {
          console.error(`[Site Tracker] Error in ratechange handler:`, e);
        }
      };
      video.addEventListener('ratechange', ratechangeHandler);
      listeners.push({ event: 'ratechange', handler: ratechangeHandler });
      
      // Store listeners for cleanup
      eventListeners.set(video, listeners);
    } catch (e) {
      console.error(`[Site Tracker] Error setting up video monitoring:`, e);
    }
  });
}

// Update play time with better accuracy and error handling
function updatePlayTime() {
  try {
    if (mediaState.isPlaying && mediaState.startTime) {
      const now = Date.now();
      const timeDiff = now - mediaState.lastUpdate;
      
      // Only add time if it's reasonable (prevents huge jumps)
      if (timeDiff > 0 && timeDiff < 30000) { // Max 30 seconds per update
        mediaState.totalPlayTime += timeDiff;
        mediaState.lastUpdate = now;
      } else if (timeDiff >= 30000) {
        // If time jump is too large, reset to prevent errors
        console.warn(`[Site Tracker] Large time jump detected: ${timeDiff}ms, resetting timer`);
        mediaState.lastUpdate = now;
      }
    }
  } catch (e) {
    console.error(`[Site Tracker] Error updating play time:`, e);
  }
}

// Send media state to background script with tab ID and error handling
function sendMediaUpdate() {
  try {
    const message = {
      type: 'MEDIA_STATE_UPDATE',
      data: {
        domain: window.location.hostname,
        isPlaying: mediaState.isPlaying,
        playTime: Math.floor(mediaState.totalPlayTime / 1000),
        url: window.location.href,
        videoId: mediaState.currentVideoId,
        tabId: null // Will be filled by background script
      }
    };
    
    console.log(`[Site Tracker] Sending media update:`, message);
    
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.log(`[Site Tracker] Error sending message:`, chrome.runtime.lastError);
      } else {
        console.log(`[Site Tracker] Message sent successfully:`, response);
      }
    });
  } catch (e) {
    console.error(`[Site Tracker] Error sending media update:`, e);
  }
}

// Monitor for new video elements being added
function setupMutationObserver() {
  observer = new MutationObserver((mutations) => {
    let shouldRefresh = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'VIDEO' || 
                (node.tagName === 'IFRAME' && node.src && node.src.includes('youtube.com')) ||
                node.querySelector('video') ||
                node.querySelector('iframe[src*="youtube.com"]')) {
              shouldRefresh = true;
            }
          }
        });
      }
    });
    
    if (shouldRefresh) {
      console.log(`[Site Tracker] New video elements detected, refreshing...`);
      setTimeout(() => {
        findVideoElements();
        setupVideoMonitoring();
      }, 100);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Periodic update while media is playing (less frequent)
function startPeriodicUpdates() {
  if (periodicUpdateInterval) {
    clearInterval(periodicUpdateInterval);
  }
  
  periodicUpdateInterval = setInterval(() => {
    if (mediaState.isPlaying) {
      updatePlayTime();
      sendMediaUpdate();
    }
  }, 10000); // Update every 10 seconds instead of 5
}

// Initialize when DOM is ready
function initialize() {
  if (isYouTube()) {
    console.log(`[Site Tracker] Initializing on YouTube...`);
    // Wait a bit for YouTube's dynamic content to load
    setTimeout(() => {
      findVideoElements();
      setupVideoMonitoring();
      setupMutationObserver();
      startPeriodicUpdates();
    }, 2000);
  } else {
    console.log(`[Site Tracker] Not on YouTube, skipping media detection`);
  }
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.hidden && mediaState.isPlaying) {
    // Page hidden, pause tracking
    console.log(`[Site Tracker] Page hidden, pausing media tracking`);
    updatePlayTime();
    mediaState.isPlaying = false;
    mediaState.currentVideoId = null;
    sendMediaUpdate();
  } else if (!document.hidden && mediaElements.some(v => !v.paused)) {
    // Page visible again, resume tracking
    console.log(`[Site Tracker] Page visible again, resuming media tracking`);
    const playingVideo = mediaElements.find(v => !v.paused);
    if (playingVideo) {
      mediaState.isPlaying = true;
      mediaState.startTime = Date.now();
      mediaState.lastUpdate = Date.now();
      mediaState.currentVideoId = getVideoId(playingVideo);
      sendMediaUpdate();
    }
  }
});

// Cleanup function
function cleanup() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  
  if (periodicUpdateInterval) {
    clearInterval(periodicUpdateInterval);
    periodicUpdateInterval = null;
  }
  
  clearEventListeners();
  
  // Reset state
  mediaState = {
    isPlaying: false,
    startTime: null,
    totalPlayTime: 0,
    lastUpdate: Date.now(),
    currentVideoId: null
  };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

// Also initialize on navigation (for SPAs like YouTube)
let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    console.log(`[Site Tracker] URL changed from ${lastUrl} to ${url}`);
    lastUrl = url;
    
    // Cleanup before re-initializing
    cleanup();
    
    // Re-initialize after a short delay
    setTimeout(initialize, 1000);
  }
});

urlObserver.observe(document, { subtree: true, childList: true });

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);
