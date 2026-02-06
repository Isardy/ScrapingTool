# Firefox Extension Project

## Project Type
Firefox Browser Extension (WebExtension) - Feed Discovery Tool

## Technology Stack
- Manifest V2 (Firefox compatible)
- Vanilla JavaScript
- HTML5/CSS3
- WebExtensions API

## Project Status
- [x] Verify copilot-instructions.md created
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions (None required)
- [x] Compile the Project (No compilation needed - vanilla JS)
- [x] Create and Run Task (Not required for extensions)
- [ ] Launch the Project
- [x] Ensure Documentation is Complete

## Project Structure
- manifest.json - Extension configuration
- background.js - Background script for messaging
- content.js - Content script for feed discovery
- popup/ - Popup UI (HTML, CSS, JS)
- icons/ - Extension icons (SVG and PNG)
- README.md - Full documentation
- INSTALL.md - Installation instructions

## Development Notes
- Firefox extension using WebExtensions API
- Compatible with Mozilla Add-ons ecosystem
- Uses Manifest V2 for maximum compatibility
- No build tools or dependencies required
- Load via about:debugging for testing

## Features Implemented
- Sitemap discovery (robots.txt and common paths)
- RSS/Atom feed detection (HTML meta tags and common paths)
- Automated URL checking for feeds and sitemaps
- JSON export functionality
- Modern gradient UI design
- Sitemap index parsing with collapsible nested lists
- Login page discovery (link/button analysis + common paths)
- Multi-language support (English & French keywords)
