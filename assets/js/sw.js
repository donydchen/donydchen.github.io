---
# Service worker for offline support — homemade, NOT Hydejack PRO.
# Hydejack's `offline.enabled` config flag is a slot the free theme reads
# but never acts on (offline support is a PRO-only feature). This file
# implements the cache-first / network-first strategy ourselves, scoped
# to `/` and registered from `_includes/my-body.html`.
#
# Source lives at assets/js/sw.js for tidiness; `permalink: /sw.js`
# below forces Jekyll to publish it at the site root because a service
# worker's default scope equals the directory it's served from, and
# only a root-served sw.js can intercept fetches for the whole site.
# (GitHub Pages doesn't allow the `Service-Worker-Allowed` header that
# would let us widen scope from a subdir.)
layout: null
sitemap: false
permalink: /sw.js
---
/* eslint-env serviceworker */

/* Cache name is build-time tagged so a content rebuild AND a manual
   `cache_version` bump in _config.yml both invalidate everything that
   was cached under the old key. The activate handler then deletes any
   cache whose name starts with our PREFIX but isn't the current one. */
const PREFIX = 'donydchen-';
const CACHE_VERSION = 'v{{ site.hydejack.offline.cache_version | default: 1 }}';
const BUILD_TIME = '{{ site.time | date_to_xmlschema }}';
const CACHE_NAME = PREFIX + CACHE_VERSION + '-' + BUILD_TIME;

/* Precache the shell so a cold offline visit still gets the homepage
   and the basic styling. Runtime cache fills in everything else. Keep
   this list small — iOS Safari is stingy with SW storage budget. */
const PRECACHE_URLS = [
  '{{ "/"                                     | relative_url }}',
  '{{ "/404.html"                             | relative_url }}',
  '{{ "/assets/css/hydejack-9.2.1.css"        | relative_url }}',
  '{{ "/assets/icomoon/style.css"             | relative_url }}',
  '{{ "/assets/js/hydejack-9.2.1.js"          | relative_url }}',
  '{% if site.logo %}{{ site.logo            | relative_url }}{% endif %}'
  {%- for asset in site.hydejack.offline.precache_assets -%}
  ,'{{ asset | relative_url }}'
  {%- endfor -%}
].filter(Boolean);

const ASSETS_PREFIX        = '{{ "/assets/"        | relative_url }}';
const ASSETS_VIDEOS_PREFIX = '{{ "/assets/videos/" | relative_url }}';

/* Paths the SW must never cache. Categories:
   - Live-data files that must always be fresh (sitemap, feed, redirects).
   - The SW source itself.
   - Prohibitively large or unrelated content:
       - /assets/videos/ — defense pattern for large media. Currently
         empty after the mvsplat360 demo MP4 was removed, but the
         pattern stays so any future big asset under this path is
         skipped automatically.
       - /matchnerf/, /mvsplat/, /mvsplat360/, /sem2nerf/ — separate
         project pages (each 10–50 MB, ~110 MB combined). They're hosted
         under this domain but are NOT part of the homepage and aren't
         needed offline.
   Cross-origin requests are handled separately in the fetch handler
   below — they bypass the SW entirely. */
const NEVER_CACHE_PATTERNS = [
  /\/sw\.js$/,
  /\/sitemap\.xml$/,
  /\/feed\.xml$/,
  /\/redirects\.json$/,
  /\/robots\.txt$/,
  new RegExp('^' + ASSETS_VIDEOS_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  /^\/matchnerf\//,
  /^\/mvsplat\//,
  /^\/mvsplat360\//,
  /^\/sem2nerf\//
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        /* `addAll` is atomic — one missing URL aborts the whole batch.
           Use individual `add()` so a stale precache entry doesn't fail
           the install (e.g. if the user removes a precached asset
           between deploys before bumping cache_version). */
        return Promise.all(
          PRECACHE_URLS.map(function (url) {
            return cache.add(url).catch(function () { /* skip if missing */ });
          })
        );
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) { return k.indexOf(PREFIX) === 0 && k !== CACHE_NAME; })
          .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);

  /* Only handle our own origin. Cross-origin (clustrmaps, Google Fonts,
     etc.) bypasses the SW entirely — fetch goes straight to the network
     and our deferred clustrmaps loader's onerror still fires correctly
     when the visitor blocks it. */
  if (url.origin !== self.location.origin) return;

  /* Bail-out list (videos, sitemap, sw itself, …). */
  for (var i = 0; i < NEVER_CACHE_PATTERNS.length; i++) {
    if (NEVER_CACHE_PATTERNS[i].test(url.pathname)) return;
  }

  /* Strategy split:
     - /assets/*  → cache-first (everything is build-time-versioned by
                    filename, so cache entries can live "forever")
     - everything else → network-first with cache fallback (HTML, sitemap
                    overrides removed above, etc.)
     We only call respondWith for paths we recognise; unrecognised paths
     fall through to the browser's default fetch. */
  if (url.pathname.indexOf(ASSETS_PREFIX) === 0) {
    event.respondWith(cacheFirst(req));
    return;
  }
  if (req.mode === 'navigate' ||
      (req.headers.get('accept') || '').indexOf('text/html') !== -1) {
    event.respondWith(networkFirst(req));
  }
});

function cacheFirst(req) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(function () { return cached || Response.error(); });
    });
  });
}

function networkFirst(req) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return fetch(req).then(function (res) {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(function () {
      return cache.match(req).then(function (cached) {
        if (cached) return cached;
        /* Last-ditch fallback for unknown URLs while offline. Use the
           cached 404 page if available; otherwise fail. */
        return cache.match('{{ "/404.html" | relative_url }}')
          || Response.error();
      });
    });
  });
}
