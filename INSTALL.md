# How to Load the Extension in Firefox

## Development Installation

1. **Open Firefox** browser

2. **Navigate to debugging page**:
   - Type `about:debugging` in the address bar
   - Or go to Menu → More tools → Extensions & Themes, then click the gear icon → Debug Add-ons

3. **Click "This Firefox"** in the left sidebar

4. **Click "Load Temporary Add-on..."** button

5. **Navigate** to the ScrapingTool directory

6. **Select** the `manifest.json` file

7. The extension should now appear in your toolbar! 🎉

## Testing the Extension

1. Navigate to any website (try https://example.com)
2. Click the ScrapingTool icon in the toolbar
3. Try the default selector `p` to scrape all paragraphs
4. Click "Highlight" to see elements highlighted on the page
5. Click "Scrape Data" to extract the content

## Debugging

- **Content Script Console**: Open DevTools (F12) on any webpage
- **Background Script Console**: Go to `about:debugging` → This Firefox → Inspect (next to your extension)
- **Popup Console**: Right-click the popup → Inspect Element

## Troubleshooting

- **Extension not loading?** Make sure you selected `manifest.json`
- **No data scraped?** Check that your CSS selector is valid
- **Permissions error?** The extension needs `<all_urls>` permission to work on all sites

## Packaging for Distribution

To create a distributable .xpi file:

```bash
cd /home/isardy/Projects/ScrapingTool
zip -r -FS scrapingtool.xpi * --exclude '*.git*' '*.DS_Store'
```

Then submit to https://addons.mozilla.org/developers/
