/**
 * Content script for ScrapingTool extension
 * Discovers sitemaps and RSS feeds on web pages
 */

// Listen for messages from background script or popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received message:", message);
  
  if (message.type === "discoverFeeds") {
    discoverSitemapsAndFeeds()
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.type === "discoverLogin") {
    discoverLoginPages()
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

/**
 * Discover sitemaps and RSS feeds for the current site
 * @returns {Promise<Object>} Object containing discovered sitemaps and feeds
 */
async function discoverSitemapsAndFeeds() {
  const baseUrl = window.location.origin;
  const results = {
    sitemaps: [],
    rssFeeds: [],
    robotsTxt: null
  };
  
  // Check HTML for feed links
  const htmlFeeds = findFeedsInHTML();
  results.rssFeeds.push(...htmlFeeds);
  
  // Check robots.txt for sitemaps
  try {
    const robotsSitemaps = await checkRobotsTxt(baseUrl);
    results.robotsTxt = robotsSitemaps.robotsUrl;
    results.sitemaps.push(...robotsSitemaps.sitemaps);
  } catch (error) {
    console.log("Could not fetch robots.txt:", error);
  }
  
  // Check common sitemap paths
  const commonSitemaps = await checkCommonPaths(baseUrl, [
    '/sitemap.xml',
    '/sitemap_index.xml',
    '/sitemap-index.xml',
    '/sitemap1.xml',
    '/sitemap',
    '/sitemaps.xml',
    '/sitemap-news.xml',
    '/post-sitemap.xml',
    '/news-sitemap.xml',
    '/sitemap_news.xml',
    '/googlenews.xml',
    '/google-news.xml',
    '/sitemap_google.xml',
    '/google-sitemap.xml',
    '/sitemap⁻google-news.xml',
    '/sitemap-actu.xml',
    '/sitemap-actualites.xml',
    '/sitemap-articles.xml',
    '/plan-du-site.xml',
    '/plan-site.xml'
  ]);
  results.sitemaps.push(...commonSitemaps);
  
  // Check common RSS feed paths
  const commonFeeds = await checkCommonPaths(baseUrl, [
    '/feed',
    '/rss',
    '/feed.xml',
    '/rss.xml',
    '/atom.xml',
    '/feed/',
    '/rss/',
    '/blog/feed',
    '/blog/rss',
    '/news/feed',
    '/news/rss',
    '/index.xml'
  ]);
  results.rssFeeds.push(...commonFeeds);
  
  // Remove duplicates
  results.sitemaps = [...new Set(results.sitemaps)];
  results.rssFeeds = [...new Set(results.rssFeeds)];
  
  // Parse sitemap indexes to find nested sitemaps
  const sitemapsWithChildren = [];
  for (const sitemapUrl of results.sitemaps) {
    const children = await parseSitemapIndex(sitemapUrl);
    sitemapsWithChildren.push({
      url: sitemapUrl,
      children: children,
      isIndex: children.length > 0
    });
  }
  results.sitemaps = sitemapsWithChildren;
  
  return results;
}

/**
 * Find RSS/Atom feeds in HTML link tags
 * @returns {Array<string>} Array of feed URLs
 */
function findFeedsInHTML() {
  const feeds = [];
  const linkTags = document.querySelectorAll('link[rel="alternate"]');
  
  linkTags.forEach(link => {
    const type = link.getAttribute('type');
    const href = link.getAttribute('href');
    
    if (href && (type === 'application/rss+xml' || type === 'application/atom+xml')) {
      // Convert relative URLs to absolute
      const absoluteUrl = new URL(href, window.location.href).href;
      feeds.push(absoluteUrl);
    }
  });
  
  // Also check for sitemap link tags
  document.querySelectorAll('link[rel="sitemap"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      const absoluteUrl = new URL(href, window.location.href).href;
      feeds.push(absoluteUrl);
    }
  });
  
  return feeds;
}

/**
 * Check robots.txt for sitemap declarations
 * @param {string} baseUrl - Base URL of the site
 * @returns {Promise<Object>} Object with robots URL and sitemap URLs
 */
async function checkRobotsTxt(baseUrl) {
  const robotsUrl = `${baseUrl}/robots.txt`;
  const response = await fetch(robotsUrl);
  
  if (!response.ok) {
    throw new Error('robots.txt not found');
  }
  
  const text = await response.text();
  const sitemaps = [];
  
  // Parse robots.txt for Sitemap: directives
  const lines = text.split('\n');
  lines.forEach(line => {
    const match = line.match(/^Sitemap:\s*(.+)$/i);
    if (match) {
      sitemaps.push(match[1].trim());
    }
  });
  
  return { robotsUrl, sitemaps };
}

/**
 * Check multiple paths to see if they exist
 * @param {string} baseUrl - Base URL of the site
 * @param {Array<string>} paths - Array of paths to check
 * @returns {Promise<Array<string>>} Array of valid URLs
 */
async function checkCommonPaths(baseUrl, paths) {
  const validUrls = [];
  
  // Check paths in batches to avoid overwhelming the server
  const batchSize = 5;
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    const promises = batch.map(path => checkUrl(`${baseUrl}${path}`));
    const results = await Promise.all(promises);
    validUrls.push(...results.filter(url => url !== null));
  }
  
  return validUrls;
}

/**
 * Check if a URL exists (returns 200)
 * @param {string} url - URL to check
 * @returns {Promise<string|null>} URL if valid, null otherwise
 */
async function checkUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      return url;
    }
  } catch (error) {
    // URL doesn't exist or fetch failed
  }
  return null;
}

/**
 * Parse a sitemap index to extract child sitemap URLs
 * @param {string} sitemapUrl - URL of the sitemap to parse
 * @returns {Promise<Array<string>>} Array of child sitemap URLs
 */
async function parseSitemapIndex(sitemapUrl) {
  try {
    // Check if this might be a sitemap index based on URL patterns
    const isLikelyIndex = /sitemap[_-]?index|index[_-]?sitemap/i.test(sitemapUrl);
    
    // Fetch the sitemap content
    const response = await fetch(sitemapUrl);
    if (!response.ok) {
      return [];
    }
    
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    // Check if there's a parsing error
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      return [];
    }
    
    // Look for sitemapindex root element
    const sitemapIndex = xmlDoc.querySelector('sitemapindex');
    if (!sitemapIndex) {
      // Not a sitemap index, return empty array
      return [];
    }
    
    // Extract all <sitemap><loc> elements
    const childSitemaps = [];
    const sitemapElements = xmlDoc.querySelectorAll('sitemap > loc');
    
    sitemapElements.forEach(locElement => {
      const url = locElement.textContent.trim();
      if (url) {
        childSitemaps.push(url);
      }
    });
    
    return childSitemaps;
  } catch (error) {
    console.log(`Error parsing sitemap index ${sitemapUrl}:`, error);
    return [];
  }
}

/**
 * Discover login pages for the current site
 * @returns {Promise<Object>} Object containing discovered login pages
 */
async function discoverLoginPages() {
  const baseUrl = window.location.origin;
  const results = {
    loginPages: [],
    foundFrom: []
  };
  
  // Find login links in HTML
  const htmlLogins = findLoginLinksInHTML();
  results.loginPages.push(...htmlLogins.map(item => item.url));
  results.foundFrom.push(...htmlLogins.map(item => ({ url: item.url, source: item.source })));
  
  // Check common login page paths
  const commonLogins = await checkCommonPaths(baseUrl, [
    '/login',
    '/signin',
    '/sign-in',
    '/log-in',
    '/auth',
    '/authenticate',
    '/account/login',
    '/user/login',
    '/member/login',
    '/members/login',
    '/wp-login.php',
    '/wp-admin',
    '/admin/login',
    '/admin',
    '/connexion',
    '/se-connecter',
    '/compte/connexion',
    '/utilisateur/connexion',
    '/membre/connexion'
  ]);
  
  commonLogins.forEach(url => {
    if (!results.loginPages.includes(url)) {
      results.loginPages.push(url);
      results.foundFrom.push({ url, source: 'Common path' });
    }
  });
  
  // Remove duplicates while preserving source info
  const uniqueLogins = [];
  const seenUrls = new Set();
  
  results.foundFrom.forEach(item => {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      uniqueLogins.push(item);
    }
  });
  
  return {
    loginPages: uniqueLogins
  };
}

/**
 * Find login links in the HTML page
 * @returns {Array<Object>} Array of login link objects with url and source
 */
function findLoginLinksInHTML() {
  const logins = [];
  const loginKeywords = [
    // English
    'login', 'log in', 'signin', 'sign in', 'log-in', 'sign-in',
    // French
    'connexion', 'se connecter', 'connecter', 'se-connecter',
    'mon compte', 'espace membre'
  ];
  
  // Check all links on the page
  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    const text = link.textContent.trim().toLowerCase();
    const ariaLabel = (link.getAttribute('aria-label') || '').toLowerCase();
    const title = (link.getAttribute('title') || '').toLowerCase();
    
    // Check if link text, aria-label, or title contains login keywords
    const combinedText = `${text} ${ariaLabel} ${title}`;
    const isLoginLink = loginKeywords.some(keyword => 
      combinedText.includes(keyword.toLowerCase())
    );
    
    // Also check if href contains login keywords
    const hrefLower = href.toLowerCase();
    const hrefContainsLogin = loginKeywords.some(keyword => 
      hrefLower.includes(keyword.replace(/\s+/g, '-')) || 
      hrefLower.includes(keyword.replace(/\s+/g, ''))
    );
    
    if ((isLoginLink || hrefContainsLogin) && href) {
      try {
        // Convert relative URLs to absolute
        const absoluteUrl = new URL(href, window.location.href).href;
        const linkText = text || ariaLabel || title || 'Login link';
        logins.push({
          url: absoluteUrl,
          source: `Found in link: "${linkText.substring(0, 50)}"`
        });
      } catch (e) {
        // Invalid URL, skip
      }
    }
  });
  
  // Check buttons that might trigger login (with onclick handlers)
  const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
  
  buttons.forEach(button => {
    const text = (button.textContent || button.value || '').trim().toLowerCase();
    const ariaLabel = (button.getAttribute('aria-label') || '').toLowerCase();
    const combinedText = `${text} ${ariaLabel}`;
    
    const isLoginButton = loginKeywords.some(keyword => 
      combinedText.includes(keyword.toLowerCase())
    );
    
    if (isLoginButton) {
      // Check if button is inside a form with action
      const form = button.closest('form');
      if (form && form.action) {
        try {
          const absoluteUrl = new URL(form.action, window.location.href).href;
          logins.push({
            url: absoluteUrl,
            source: `Found in form with button: "${text.substring(0, 50)}"`
          });
        } catch (e) {
          // Invalid URL, skip
        }
      }
    }
  });
  
  return logins;
}

console.log("ScrapingTool content script loaded on:", window.location.href);
