// Service Worker for Offline App Shell Support
// TODO: Implement cache name and list of core assets to cache for offline app shell loading

// TODO: Implement 'install' event listener
// - Open cache and add all static assets (index.html, bundles, styles)
// - Skip waiting to activate immediately

// TODO: Implement 'activate' event listener
// - Clean up old cache versions
// - Claim clients immediately

// TODO: Implement 'fetch' event listener
// - Intercept network requests
// - Bypass caching for /api/ and /ws/ endpoints
// - Serve cached response if available, otherwise fetch from network and cache response
// - Provide offline fallback for document navigation
