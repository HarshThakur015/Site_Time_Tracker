// storage.js
// Helper functions for interacting with chrome.storage.local for site tracker extension.
// Now also handles media playback time tracking.

/**
 * Get all site times, unique sites, and media times from storage.
 * @param {function} callback - Receives { siteTimes, uniqueSites, mediaTimes }
 */
function getTrackingData(callback) {
  chrome.storage.local.get(["siteTimes", "uniqueSites", "mediaTimes"], (data) => {
    callback({
      siteTimes: data.siteTimes || {},
      uniqueSites: data.uniqueSites || [],
      mediaTimes: data.mediaTimes || {}
    });
  });
}

/**
 * Set site times, unique sites, and media times in storage.
 * @param {object} siteTimes
 * @param {array} uniqueSites
 * @param {object} mediaTimes
 * @param {function} [callback]
 */
function setTrackingData(siteTimes, uniqueSites, mediaTimes = {}, callback) {
  chrome.storage.local.set({ siteTimes, uniqueSites, mediaTimes }, () => {
    if (callback) callback();
  });
}

/**
 * Get only media times from storage.
 * @param {function} callback - Receives { mediaTimes }
 */
function getMediaTimes(callback) {
  chrome.storage.local.get(["mediaTimes"], (data) => {
    callback({
      mediaTimes: data.mediaTimes || {}
    });
  });
}

// Export for popup.js usage
window.getTrackingData = getTrackingData;
window.setTrackingData = setTrackingData;
window.getMediaTimes = getMediaTimes;
