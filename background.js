/**
 * Background script for ScrapingTool extension
 * Handles extension lifecycle and message passing
 */

// Listen for extension installation or update
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("ScrapingTool extension installed");
    // Set default settings
    browser.storage.local.set({
      enabled: true,
      lastUsed: Date.now()
    });
  } else if (details.reason === "update") {
    console.log("ScrapingTool extension updated");
  }
});

// Listen for messages from content scripts or popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background:", message);
  
  if (message.type === "scrape") {
    // Handle scraping request
    handleScraping(message.data, sender.tab.id)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (message.type === "getData") {
    // Retrieve stored data
    browser.storage.local.get(null)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// Handle scraping logic
async function handleScraping(data, tabId) {
  try {
    // Send message to content script to perform scraping
    const response = await browser.tabs.sendMessage(tabId, {
      type: "performScrape",
      selector: data.selector
    });
    
    // Store scraped data
    await browser.storage.local.set({
      lastScrape: {
        timestamp: Date.now(),
        data: response.data,
        url: data.url
      }
    });
    
    return response.data;
  } catch (error) {
    console.error("Scraping error:", error);
    throw error;
  }
}

// Listen for tab updates to inject content scripts if needed
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    console.log("Tab updated:", tab.url);
  }
});

console.log("ScrapingTool background script loaded");
