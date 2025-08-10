# Site Tracker Extension - The Ultimate Screen Time Tracker

**The most advanced and accurate Chrome extension for tracking your digital life - from browsing to media consumption!**

## 🚀 Why This Is The Best Extension For Your Screen Time

### ✨ **Unmatched Accuracy & Intelligence**
- **Smart Media Detection**: Unlike other extensions that only track active tab time, this extension intelligently detects when videos are playing, even when you're not actively interacting with the page
- **Dual Tracking System**: Combines traditional website tracking with sophisticated media playback monitoring for complete digital activity insights
- **Real-time Updates**: Updates every 5-15 seconds while media is playing, ensuring no time is missed or double-counted

### 🎯 **YouTube-First Design**
- **Built for Modern Web**: Specifically designed to handle YouTube's dynamic content loading and single-page application architecture
- **Seamless Navigation**: Tracks time across YouTube page changes without losing your progress
- **Background Playback**: Counts time even when videos play in background tabs or minimized windows

### 🛡️ **Rock-Solid Reliability**
- **12 Critical Improvements**: Built on extensive testing and real-world usage to eliminate common tracking failures
- **Memory Leak Prevention**: Advanced cleanup systems prevent browser slowdowns and crashes
- **Error Recovery**: Robust error handling ensures tracking continues even when unexpected issues occur

## 🎉 **What Makes This Extension Special**

### 🔥 **Critical Loopholes Fixed**
1. **Multiple Video Handling**: Tracks individual videos separately, preventing conflicts when multiple videos exist on a page
2. **Race Condition Elimination**: Per-tab tracking prevents data corruption from multiple tabs
3. **Memory Leak Prevention**: Proper event listener cleanup ensures long-term stability
4. **Time Calculation Accuracy**: Smart throttling and validation prevent erroneous time jumps
5. **Tab Lifecycle Management**: Handles tab creation, switching, and closure gracefully
6. **Window Focus Handling**: Stops tracking when browser loses focus, resumes when regained

### 🚀 **Additional Improvements Made**
7. **Enhanced Video Detection**: Validates video elements and handles iframe content
8. **Advanced Event Handling**: Monitors seeking, buffering, playback speed changes
9. **Performance Optimization**: Reduced update frequency for better browser performance
10. **Cross-Platform Compatibility**: Works across different YouTube domains and mobile versions
11. **State Persistence**: Maintains tracking data across browser sessions and crashes
12. **Debugging Tools**: Comprehensive logging for troubleshooting and optimization

## 🎯 **Perfect For**

- **Content Creators** who need to track research time
- **Students** monitoring study and entertainment time
- **Professionals** analyzing productivity patterns
- **Parents** understanding children's digital habits
- **Anyone** who wants accurate insights into their online time

## 🕒 **Features That Set Us Apart**

### **Regular Site Tracking**
- Tracks time spent on each website with precision
- Counts unique sites visited in a session
- Resets data at midnight each day
- Persists data across browser sessions

### **Revolutionary Media Playback Tracking**
- **Automatically detects YouTube video playback** without any setup
- **Tracks time even when the screen is still** - the feature that makes us unique!
- Handles play, pause, and end events intelligently
- Works with YouTube's dynamic content loading
- Tracks time across page navigation within YouTube
- **Separate media time storage** for detailed analytics

## 🔧 **How It Works - The Smart Way**

### **Intelligent Media Detection**
The extension uses advanced content scripts to:
1. **Detect video elements** on YouTube pages automatically
2. **Monitor playback events** (play, pause, end, timeupdate, seeked, buffering)
3. **Send real-time updates** to the background script with tab-specific context
4. **Handle YouTube's SPA navigation** seamlessly without losing tracking data

### **Dual Time Tracking System**
- **Regular site time**: Tracks when you're actively browsing and interacting
- **Media playback time**: Tracks when videos are playing (even if screen is still)
- **Separate storage**: Media time is stored separately from regular site time for detailed analysis
- **Real-time updates**: Updates every 5-15 seconds while media is playing for accuracy

## 📊 **What You'll See**

The extension provides a comprehensive dashboard showing:
- **Total browser time** - Your overall digital activity
- **Total media playback time** - Time spent watching videos
- **Individual site times** - Breakdown by website
- **Individual media playback times** - Video watching time per site
- **Real-time updates** - Live tracking as you browse and watch

## 🚀 **Installation - Simple & Fast**

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the extension folder
5. The extension icon appears in your toolbar - you're ready to go!

## 💡 **Usage - Set It & Forget It**

1. **Click the extension icon** to see your comprehensive tracking data
2. **Browse normally** - regular site time is tracked automatically
3. **Watch YouTube videos** - media playback time is tracked automatically
4. **Get insights** - view both metrics in one beautiful popup interface

## 🐛 **Advanced Debugging & Support**

The extension includes enterprise-level debugging capabilities:

- **Content script logs**: Look for `[Site Tracker]` messages in the page console
- **Background script logs**: Detailed tracking information in the extension's background page
- **Real-time monitoring**: Watch tracking events as they happen

To view background logs:
1. Go to `chrome://extensions/`
2. Find "Site Tracker Extension"
3. Click "service worker" under "Inspect views"
4. Check the console tab for detailed tracking information

## 🏗️ **Technical Excellence**

### **Architecture**
- `background.js` - Advanced media tracking with per-tab state management
- `content.js` - Intelligent video detection with memory leak prevention
- `popup/` - Beautiful, responsive user interface
- `storage/` - Robust data persistence with backup/restore capabilities
- `manifest.json` - Optimized extension configuration

### **Permissions & Security**
- `tabs` - Track active tabs securely
- `storage` - Save tracking data locally
- `activeTab` - Access current tab safely
- `scripting` - Inject content scripts efficiently
- `alarms` - Schedule daily resets automatically
- `<all_urls>` - Access all websites for comprehensive tracking

### **Data Storage**
- `siteTimes` - Regular website visit times with domain tracking
- `uniqueSites` - List of visited sites for session analysis
- `mediaTimes` - Media playback times per domain with video tracking

## 🔍 **Troubleshooting - We've Got You Covered**

### **Media Time Not Tracking**
1. Check console for `[Site Tracker]` messages - we provide detailed logging
2. Ensure you're on YouTube (www.youtube.com, m.youtube.com, etc.)
3. Wait a few seconds for the extension to initialize
4. Try refreshing the page - our SPA detection handles this automatically

### **Extension Not Working**
1. Check if extension is enabled in `chrome://extensions/`
2. Look for errors in the extension's service worker
3. Try reloading the extension
4. Check browser console for any errors - our logging will help identify issues

## 🚀 **Future Roadmap**

- **Multi-Platform Support**: Netflix, Hulu, Twitch, and other video platforms
- **Custom Time Categories**: Work, entertainment, education tracking
- **Data Export**: CSV, JSON, and integration with productivity tools
- **Productivity Insights**: AI-powered analysis and recommendations
- **Custom Tracking Rules**: Personalized tracking preferences
- **Mobile Extension**: Chrome mobile and other browsers

## 🏆 **Why Choose This Extension?**

1. **Accuracy**: Tracks both active browsing AND background media playback
2. **Reliability**: Built with 12 critical improvements for rock-solid performance
3. **Intelligence**: Handles modern web apps like YouTube seamlessly
4. **Performance**: Optimized to not slow down your browsing experience
5. **Transparency**: Comprehensive logging and debugging tools
6. **Future-Proof**: Designed for the modern web with extensible architecture

## 📄 **License**

This project is open source and available under the MIT License. We believe in transparency and community-driven development.

---

**Ready to get the most accurate screen time tracking available? Install this extension and discover how much time you're really spending online!** 🎯✨
#   S i t e _ T i m e _ T r a c k e r  
 