/**
 * Popup script for ScrapingTool extension
 * Handles feed, sitemap, and login page discovery
 */

// DOM elements
const discoverFeedsBtn = document.getElementById('discoverFeedsBtn');
const discoverLoginBtn = document.getElementById('discoverLoginBtn');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const feedResultsDiv = document.getElementById('feedResults');
const loginResultsDiv = document.getElementById('loginResults');
const sitemapListDiv = document.getElementById('sitemapList');
const feedListDiv = document.getElementById('feedList');
const loginListDiv = document.getElementById('loginList');
const sitemapCountSpan = document.getElementById('sitemapCount');
const feedCountSpan = document.getElementById('feedCount');
const loginCountSpan = document.getElementById('loginCount');
const statusDiv = document.getElementById('status');

let currentFeeds = null;
let currentLogins = null;

// Event listeners
discoverFeedsBtn.addEventListener('click', handleDiscoverFeeds);
discoverLoginBtn.addEventListener('click', handleDiscoverLogin);
clearBtn.addEventListener('click', handleClear);
exportBtn.addEventListener('click', handleExport);

/**
 * Handle discovering sitemaps and RSS feeds
 */
async function handleDiscoverFeeds() {
  try {
    discoverFeedsBtn.disabled = true;
    discoverFeedsBtn.textContent = 'Discovering...';
    
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    
    const response = await browser.tabs.sendMessage(activeTab.id, {
      type: 'discoverFeeds'
    });
    
    if (response.success) {
      currentFeeds = response.data;
      displayFeeds(response.data);
      showStatus(`Found ${response.data.sitemaps.length} sitemaps and ${response.data.rssFeeds.length} feeds`, 'success');
    } else {
      showStatus(`Error: ${response.error}`, 'error');
    }
  } catch (error) {
    console.error('Feed discovery error:', error);
    showStatus(`Error: ${error.message}`, 'error');
  } finally {
    discoverFeedsBtn.disabled = false;
    discoverFeedsBtn.innerHTML = '<span class="icon">🗺️</span> Discover Sitemaps & Feeds';
  }
}

/**
 * Display discovered sitemaps and feeds
 */
function displayFeeds(data) {
  feedResultsDiv.classList.remove('hidden');
  
  // Display sitemaps
  sitemapCountSpan.textContent = data.sitemaps.length;
  if (data.sitemaps.length === 0) {
    sitemapListDiv.innerHTML = '<p class="no-feeds">No sitemaps found</p>';
  } else {
    sitemapListDiv.innerHTML = data.sitemaps.map((sitemap, index) => {
      const sitemapId = `sitemap-${index}`;
      
      if (sitemap.isIndex && sitemap.children.length > 0) {
        // Sitemap index with children
        return `
          <div class="feed-item sitemap-index">
            <div class="sitemap-header" data-sitemap-id="${sitemapId}">
              <span class="feed-icon">🗺️</span>
              <a href="${escapeHtml(sitemap.url)}" target="_blank" title="${escapeHtml(sitemap.url)}" onclick="event.stopPropagation();">${escapeHtml(sitemap.url)}</a>
              <span class="expand-icon" title="Show ${sitemap.children.length} nested sitemaps">▶</span>
            </div>
            <div class="sitemap-children hidden" id="${sitemapId}">
              ${sitemap.children.map(childUrl => `
                <div class="feed-item child-sitemap">
                  <span class="feed-icon">📄</span>
                  <a href="${escapeHtml(childUrl)}" target="_blank" title="${escapeHtml(childUrl)}">${escapeHtml(childUrl)}</a>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        // Regular sitemap
        return `
          <div class="feed-item">
            <span class="feed-icon">🗺️</span>
            <a href="${escapeHtml(sitemap.url)}" target="_blank" title="${escapeHtml(sitemap.url)}">${escapeHtml(sitemap.url)}</a>
          </div>
        `;
      }
    }).join('');
    
    // Add click listeners for expanding/collapsing sitemap indexes
    document.querySelectorAll('.sitemap-header').forEach(header => {
      header.addEventListener('click', toggleSitemapChildren);
    });
  }
  
  // Display RSS feeds
  feedCountSpan.textContent = data.rssFeeds.length;
  if (data.rssFeeds.length === 0) {
    feedListDiv.innerHTML = '<p class="no-feeds">No RSS feeds found</p>';
  } else {
    feedListDiv.innerHTML = data.rssFeeds.map(url => `
      <div class="feed-item">
        <span class="feed-icon">📡</span>
        <a href="${escapeHtml(url)}" target="_blank" title="${escapeHtml(url)}">${escapeHtml(url)}</a>
      </div>
    `).join('');
  }
}

/**
 * Toggle sitemap children visibility
 */
function toggleSitemapChildren(event) {
  const header = event.currentTarget;
  const sitemapId = header.getAttribute('data-sitemap-id');
  const childrenDiv = document.getElementById(sitemapId);
  const expandIcon = header.querySelector('.expand-icon');
  
  if (childrenDiv && expandIcon) {
    childrenDiv.classList.toggle('hidden');
    expandIcon.textContent = childrenDiv.classList.contains('hidden') ? '▶' : '▼';
  }
}

/**
 * Handle discovering login pages
 */
async function handleDiscoverLogin() {
  try {
    discoverLoginBtn.disabled = true;
    discoverLoginBtn.textContent = 'Discovering...';
    
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    
    const response = await browser.tabs.sendMessage(activeTab.id, {
      type: 'discoverLogin'
    });
    
    if (response.success) {
      currentLogins = response.data;
      displayLoginPages(response.data);
      showStatus(`Found ${response.data.loginPages.length} login pages`, 'success');
    } else {
      showStatus(`Error: ${response.error}`, 'error');
    }
  } catch (error) {
    console.error('Login discovery error:', error);
    showStatus(`Error: ${error.message}`, 'error');
  } finally {
    discoverLoginBtn.disabled = false;
    discoverLoginBtn.innerHTML = '<span class="icon">🔐</span> Discover Login Pages';
  }
}

/**
 * Display discovered login pages
 */
function displayLoginPages(data) {
  loginResultsDiv.classList.remove('hidden');
  
  loginCountSpan.textContent = data.loginPages.length;
  if (data.loginPages.length === 0) {
    loginListDiv.innerHTML = '<p class="no-feeds">No login pages found</p>';
  } else {
    loginListDiv.innerHTML = data.loginPages.map(item => `
      <div class="feed-item login-item">
        <span class="feed-icon">🔐</span>
        <div class="login-info">
          <a href="${escapeHtml(item.url)}" target="_blank" title="${escapeHtml(item.url)}">${escapeHtml(item.url)}</a>
          <small class="login-source">${escapeHtml(item.source)}</small>
        </div>
      </div>
    `).join('');
  }
}

/**
 * Clear all stored data
 */
function handleClear() {
  currentFeeds = null;
  currentLogins = null;
  feedResultsDiv.classList.add('hidden');
  loginResultsDiv.classList.add('hidden');
  statusDiv.classList.add('hidden');
  showStatus('Data cleared', 'success');
}

/**
 * Export results as JSON file
 */
function handleExport() {
  if (!currentFeeds && !currentLogins) {
    showStatus('No data to export', 'error');
    return;
  }
  
  const dataToExport = {
    feeds: currentFeeds,
    logins: currentLogins,
    exportedAt: new Date().toISOString(),
    url: null
  };
  
  // Get current URL
  browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    if (tabs[0]) {
      dataToExport.url = tabs[0].url;
    }
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `feeds-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('Data exported successfully', 'success');
  });
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.classList.remove('hidden');
  
  setTimeout(() => {
    statusDiv.classList.add('hidden');
  }, 3000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

console.log('Popup script loaded');
