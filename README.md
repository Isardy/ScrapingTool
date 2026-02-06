# ScrapingTool - Firefox Extension

A Firefox browser extension for discovering sitemaps and RSS feeds on any website. Automatically find all available feeds and sitemaps by checking robots.txt, HTML meta tags, and common URL patterns.

## Features

- 🗺️ **Sitemap Discovery** - Automatically find sitemaps by checking robots.txt and common paths
- � **Sitemap Index Parsing** - Parse sitemap indexes and display nested sitemaps in collapsible lists
- �📡 **RSS Feed Detection** - Discover RSS/Atom feeds from HTML meta tags and common paths- 🔐 **Login Page Discovery** - Find login pages by analyzing links, buttons, and common paths (English & French)- 📥 **Data Export** - Export all discovered feeds as JSON
- 🎨 **Modern UI** - Clean, gradient-based design with smooth animations
- 🚀 **Fast & Lightweight** - Minimal dependencies, maximum performance

## Installation

### For Development

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Navigate to the extension directory and select `manifest.json`

### For Production

Package and submit to Mozilla Add-ons:

```bash
cd /home/isardy/Projects/ScrapingTool
zip -r scrapingtool.xpi * -x '*.git*' '*.DS_Store'
```

Then submit to: https://addons.mozilla.org/developers/

## Usage

1. **Click the extension icon** in the Firefox toolbar
2. **Click "Discover Sitemaps & Feeds"** or **"Discover Login Pages"** button
3. The extension will automatically:
   - Check `robots.txt` for sitemap declarations
   - Scan HTML `<link>` tags for RSS/Atom feeds
   - Test common sitemap paths (`/sitemap.xml`, `/sitemap_index.xml`, etc.)
   - Test common RSS paths (`/feed`, `/rss`, `/atom.xml`, etc.)
   - Parse sitemap index files to extract nested sitemaps
   - Find login links by analyzing button/link text (login, signin, connexion, etc.)
   - Test common login paths (`/login`, `/signin`, `/connexion`, `/wp-login.php`, etc.)
4. **Expand sitemap indexes** by clicking on them to view all nested sitemaps (indicated by ▶ icon)
5. **Click any discovered URL** to open it in a new tab
6. **Export** the complete list as JSON for later use

## How It Works

The extension performs multiple checks to discover all available feeds:

### Sitemap Discovery
1. **robots.txt** - Parses `Sitemap:` directives
2. **HTML meta tags** - Finds `<link rel="sitemap">` tags
3. **Common paths**:
   - `/sitemap.xml`
   - `/sitemap_index.xml`
   - `/sitemap-index.xml`
   - `/sitemap1.xml`
   - `/sitemaps.xml`
   - `/sitemap-news.xml`
   - `/post-sitemap.xml`
   - `/news-sitemap.xml`
   - `/sitemap_news.xml`
   - `/googlenews.xml`
   - `/google-news.xml`
   - `/sitemap_google.xml`
   - `/google-sitemap.xml`
   - `/sitemap-actu.xml`
   - `/sitemap-actualites.xml`
   - `/sitemap-articles.xml`
   - `/plan-du-site.xml`
   - `/plan-site.xml`
4. **Sitemap Index Parsing** - Automatically parses sitemap index files (containing `<sitemapindex>` root element) and extracts all nested sitemap URLs, displaying them in expandable lists

### RSS Feed Discovery
1. **HTML link tags** - Scans for `<link rel="alternate" type="application/rss+xml">` and `application/atom+xml`
2. **Common paths**:
   - `/feed`
   - `/rss`
   - `/feed.xml`
   - `/rss.xml`
   - `/atom.xml`
   - `/blog/feed`
   - `/news/rss`
   - `/index.xml`

### Login Page Discovery
1. **Link Analysis** - Scans all links for text containing:
   - English: login, log in, signin, sign in, log-in, sign-in
   - French: connexion, se connecter, mon compte, espace membre
2. **Button/Form Analysis** - Checks buttons and form actions for login keywords
3. **Common paths**:
   - `/login`, `/signin`, `/sign-in`, `/log-in`
   - `/auth`, `/authenticate`
   - `/account/login`, `/user/login`, `/member/login`
   - `/wp-login.php`, `/wp-admin`, `/admin/login`
   - `/connexion`, `/se-connecter`, `/compte/connexion`
4. **Source tracking** - Shows where each login page was found (link text or common path)

## Project Structure

```
ScrapingTool/
├── manifest.json         # Extension configuration
├── background.js         # Background script for message handling
├── content.js           # Content script for feed discovery
├── popup/
│   ├── popup.html       # Popup interface HTML
│   ├── popup.css        # Popup styles
│   └── popup.js         # Popup functionality
├── icons/
│   ├── icon-48.png      # 48x48 icon
│   ├── icon-96.png      # 96x96 icon
│   └── *.svg            # SVG source files
├── README.md            # This file
└── INSTALL.md           # Installation instructions
```

## Technologies

- **Manifest Version**: V2 (Firefox compatible)
- **APIs Used**:
  - `browser.tabs` - Tab management
  - `browser.storage` - Local data storage
  - `browser.runtime` - Message passing
- **Languages**: HTML, CSS, vanilla JavaScript
- **No Dependencies**: Pure WebExtensions API

## Permissions

The extension requests the following permissions:

- `activeTab` - Access the currently active tab
- `storage` - Store user preferences
- `tabs` - Query and interact with browser tabs
- `<all_urls>` - Inject content scripts and fetch resources from any site

## Development

### Debugging

- Open Firefox DevTools (F12) while on a webpage to see content script logs
- Go to `about:debugging` → This Firefox → Inspect to see background script logs
- Right-click the extension popup → Inspect Element to debug popup

### Testing

Test the extension on various types of websites:
- News sites (often have multiple RSS feeds)
- Blogs (WordPress, Ghost, etc.)
- E-commerce sites (may have product sitemaps)
- Documentation sites (often have comprehensive sitemaps)

## Known Limitations

- Some websites may block HEAD requests used for URL validation
- Sites with strict Content Security Policy may prevent content script injection
- Discovery is limited to common patterns and won't find entirely custom feed URLs

## Use Cases

- **SEO Analysis** - Quickly audit a site's sitemap structure
- **Content Aggregation** - Find RSS feeds for news monitoring
- **Security Research** - Discover login endpoints for penetration testing
- **Web Development** - Verify your own site's feed and authentication configuration
- **Research** - Discover feed sources for data collection

## Future Enhancements

- [ ] Parse individual sitemaps to extract and display all URLs
- [ ] Validate feed formats (RSS 2.0, Atom, JSON Feed)
- [ ] Detect additional feed types (JSON Feed, podcasts)
- [ ] Custom URL pattern testing
- [ ] Batch discovery across multiple tabs
- [ ] Feed reader integration
- [ ] Sitemap visualization and statistics

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
- Open an issue on GitHub
- Check Firefox extension documentation: https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions

---

**Note**: Always respect website terms of service and robots.txt when accessing feeds and sitemaps.
