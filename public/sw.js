/* Offline shell for qr-generator.

   Rules (see docs/superpowers/specs/2026-10-20-pwa-design.md):
   - Navigations: network-first, falling back to cache, then to '/'.
   - Immutable assets (/_next/static chunks — hashed URLs; /icons files —
     fixed names but effectively immutable):
     cache-first (cache on first fetch).
   - NEVER_CACHE_PREFIXES routes (API/auth — dynamic QR): network-only,
     never stored, never served from cache.
   - Everything else (RSC flight prefetches, the manifest, cross-origin,
     non-GET): pass-through untouched. Caching them would serve stale
     payloads after a deploy and grow the cache unboundedly.

   Deploying a new build: if cached asset staleness ever needs purging
   ahead of the normal flow, bump VERSION — activate deletes every other
   qr-static-* cache. (HTML navigations are network-first, so they update
   themselves; hashed chunks and the fixed-name /icons files linger until
   the bump.)

   When adding a guide, add '/guides/<slug>' to PRECACHE_PAGES —
   lib/pwa.test.ts fails if a published guide is missing from it. */

const VERSION = 'v1';
const CACHE_NAME = `qr-static-${VERSION}`;

const NEVER_CACHE_PREFIXES = ['api/'];
const IMMUTABLE_PREFIXES = ['_next/static/', 'icons/'];

const PRECACHE_PAGES = [
  '/',
  '/builder-static',
  '/guides',
  '/guides/link-qr-code-generator',
  '/guides/wifi-qr-code-generator',
  '/guides/vcard-qr-code-generator',
  '/guides/event-qr-code-generator',
  '/guides/sms-qr-code-generator',
  '/guides/instagram-qr-code-generator',
  '/guides/facebook-qr-code-generator',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // One failing URL must not brick installation; runtime caching
      // fills the gap on first visit.
      Promise.allSettled(
        PRECACHE_PAGES.map((page) => cache.add(new Request(page, { cache: 'reload' }))),
      ),
    ),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith('qr-static-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

// Matches both the bare path ('/api') and everything under it ('/api/x').
const isNeverCached = (url) =>
  NEVER_CACHE_PREFIXES.some((prefix) => {
    const base = `/${prefix.replace(/\/$/, '')}`;
    return url.pathname === base || url.pathname.startsWith(`${base}/`);
  });

const isImmutableAsset = (url) =>
  IMMUTABLE_PREFIXES.some((prefix) => url.pathname.slice(1).startsWith(prefix));

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isNeverCached(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request, event));
    return;
  }
  if (isImmutableAsset(url)) {
    event.respondWith(cacheFirst(request, event));
  }
  // Same-origin non-navigation, non-asset GETs: no respondWith — the
  // browser handles them from the network untouched.
});

async function networkFirstNavigation(request, event) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      // waitUntil: the SW can be killed the moment respondWith resolves;
      // without it the put may never complete.
      event.waitUntil(cache.put(request, response.clone()).catch(() => {}));
    }
    return response;
  } catch {
    const cached =
      (await cache.match(request)) ||
      (await cache.match('/'));
    return (
      cached ||
      new Response('Offline and this page is not cached.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' },
      })
    );
  }
}

async function cacheFirst(request, event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    event.waitUntil(cache.put(request, response.clone()).catch(() => {}));
  }
  return response;
}