// popup.js
// Fetches and displays time spent on the current site and unique sites visited.
// Now also shows media playback time (YouTube videos, etc.)

document.addEventListener('DOMContentLoaded', () => {
  window.getTrackingData(({ siteTimes, mediaTimes }) => {
    // Calculate total regular time
    const totalSeconds = Object.values(siteTimes || {}).reduce((a, b) => a + b, 0);
    const totalTimeElem = document.getElementById('total-time');
    totalTimeElem.textContent =
      totalSeconds < 60 ? `${totalSeconds} sec` : `${(totalSeconds/60).toFixed(1)} min`;

    // Calculate total media time
    const totalMediaSeconds = Object.values(mediaTimes || {}).reduce((a, b) => a + b, 0);
    const totalMediaTimeElem = document.getElementById('total-media-time');
    totalMediaTimeElem.textContent =
      totalMediaSeconds < 60 ? `${totalMediaSeconds} sec` : `${(totalMediaSeconds/60).toFixed(1)} min`;

    // List each site and its time
    const siteTimesList = document.getElementById('site-times-list');
    siteTimesList.innerHTML = '';
    // Filter out 'newtab' and system pages
    const filteredEntries = Object.entries(siteTimes || {}).filter(([site, _]) =>
      site && !site.includes('newtab') && !site.startsWith('chrome') && !site.startsWith('edge') && !site.startsWith('brave') && !site.startsWith('about:') && !site.startsWith('localhost')
    );
    if (filteredEntries.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No sites tracked yet.';
      li.style.textAlign = 'center';
      li.style.color = '#aaa';
      siteTimesList.appendChild(li);
    } else {
      filteredEntries.sort((a, b) => b[1] - a[1]).forEach(([site, seconds]) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = 'https://' + site;
        a.textContent = site;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        const timeSpan = document.createElement('span');
        timeSpan.className = 'site-time';
        timeSpan.textContent = seconds < 60 ? `${seconds} sec` : `${(seconds/60).toFixed(1)} min`;
        li.appendChild(a);
        li.appendChild(timeSpan);
        siteTimesList.appendChild(li);
      });
    }

    // List each site and its media playback time
    const mediaTimesList = document.getElementById('media-times-list');
    mediaTimesList.innerHTML = '';
    const mediaEntries = Object.entries(mediaTimes || {});
    
    if (mediaEntries.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No media playback tracked yet.';
      li.style.textAlign = 'center';
      li.style.color = '#aaa';
      mediaTimesList.appendChild(li);
    } else {
      mediaEntries.sort((a, b) => b[1] - a[1]).forEach(([site, seconds]) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = 'https://' + site;
        a.textContent = site;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        const timeSpan = document.createElement('span');
        timeSpan.className = 'site-time';
        timeSpan.textContent = seconds < 60 ? `${seconds} sec` : `${(seconds/60).toFixed(1)} min`;
        li.appendChild(a);
        li.appendChild(timeSpan);
        mediaTimesList.appendChild(li);
      });
    }
  });
});
