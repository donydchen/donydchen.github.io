# Update log — non-obvious fixes & their reasoning

Append newest at the top. Each entry should be just enough so a future
reader (you, me, or Claude) understands WHY the change was needed and
catches the trap before re-introducing it. Keep code references; skip
the diff.

The file lives under `assets/docs/` and is on Jekyll's `exclude:` list
in `_config.yml`, so it never ships to the rendered site.

---

## 2026-05 · Documentation page + footer-credit relocation

### Why
Forkers needed a single place to learn how to use the site (where to
edit content, which keys in `_config.yml` to change, how the data files
are wired). Stuffing all of that into the README was getting long, and
the upstream "Powered by Hydejack; Modified from HERE; Hosted at GitHub
Pages." paragraph was duplicating attribution on every page footer.

### What
- `docs.md` — new page rendered at `/docs/` (`layout: page`). Sections:
  Setup, Make it yours, Configuration (with the project-specific
  `desktop_cover` / `mobile_cover` per-page knobs), Adding a paper /
  co-author / project / talk / news, Publish, Going deeper, License,
  Credits.
- `_includes/body/footer.html` — removed the inline "Powered by …" `<p>`.
  Attributions now live on `/docs/#credits` instead, so every page footer
  stays focused on `<small class="copyright">` + optional legal nav.
- `README.md` — slimmed down. Top-level links to `docs.md` and
  `LICENSE.md` plus their rendered `/docs/` and `/LICENSE/` URLs. Kept
  Credits, Troubleshooting, and the CLAUDE.md pointer.
- `index.md` Miscellanies — added a fourth bullet inviting forkers to
  use the homepage as a template, with a `[the documentation](/docs/)`
  link.

### Watch out
- The Hydejack ASCII-art comment in `compress.html` still contains
  "Powered by Hydejack v9.2.1" inside an HTML comment. That's the GPL
  attribution; leave it alone. It's never user-visible.
- `docs.md` uses Kramdown IAL `{:.h1 .index-header}` on every section
  heading so the styled look matches `index.md`. The auto-derived
  slug-based IDs (`#setup`, `#configuration`, …) come for free; deep
  links like `/docs/#adding-a-paper` work without touching the file.

---

## 2026-05 · Disclaimer + footer block reordering, dingbat moved

### Why
The legal disclaimer used to live at the bottom of `index.md` only, so
404 / LICENSE pages never showed it. The user also wanted the dingbat
(Hydejack's chess-piece divider) AFTER the visitor map, not before the
disclaimer, and a visible separator between the disclaimer and the
visitor map with more breathing room.

### What
- `_includes/disclaimer.html` — heading + body block. Pulled into the
  footer on every page, so the legal notice surfaces everywhere with the
  same `<h2 class="h1 index-header" id="disclaimer">` styling.
- `_includes/body/footer.html` — order is now:
  `disclaimer.html` → `<hr class="post-disclaimer-divider">` →
  `visitor-map.html` → `components/dingbat.html` → upstream copyright
  block.
- `_layouts/plain.html`, `_layouts/page.html` — project shadows that
  STRIP the trailing `{% include components/dingbat.html %}`. The
  dingbat is now rendered from the footer include instead, after the
  disclaimer + visitor map, matching the deployed homepage's order.
- `_includes/my-head.html` — `.post-disclaimer-divider` rule with
  `margin: 2.5rem 0` for the wider gap requested.
- `index.md` — kept just the section anchor, removed the duplicate body
  block (now sourced from the include).

### Watch out
- Don't put the dingbat back in the layouts. The layout shadows exist
  specifically so the dingbat lands AFTER disclaimer + visitor-map. If
  Hydejack ever changes its `plain.html` / `page.html` upstream you'll
  need to re-sync the rest while keeping the include suppressed.
- `not-found.html` (404) doesn't have an `<article>` wrapper or its own
  dingbat — the footer include now adds one, which is fine and gives
  404 the same chrome.

---

## 2026-05 · News block moved to a data file with expiry

### Why
Time-sensitive announcements (job hunt, conference attendance, paper
release call-outs) were buried as HTML comments inside a hand-crafted
`<div id="news-notes">…</div>` block in `index.md`. Hard to surface, and
nothing told you "this is stale, hide it after the conference is over."

### What
- `_data/news.yml` — list of entries. Each entry has an `html` body and
  an optional `expires:` "YYYY-MM-DD" date. After that date the entry
  hides automatically. Commenting out an entry with `#` also hides it.
- `_includes/news.html` — Liquid template that compares
  `site.time | date: '%Y-%m-%d'` against each entry's `expires` (string
  compare on `YYYY-MM-DD` format sorts identically to chronological
  order). The wrapping `<div id="news-notes"><br />…<br /><br /></div>`
  is preserved verbatim so spacing in the homepage hero area is
  unchanged whether or not any entries are active.
- `index.md` — collapsed the original block to a single
  `{% raw %}{% include news.html %}{% endraw %}`.

### Watch out
- The freshness check uses `site.time`, set at build time. A static
  long-lived deploy won't roll the date forward — every push to GH
  Pages triggers a rebuild though, so this is fine in practice. If you
  ever introduce incremental local builds, expired entries may linger
  visually until a full rebuild.
- The four legacy entries are preserved as YAML comments in
  `_data/news.yml` so old announcements can be revived.

---

## 2026-05 · Short-Bio justify alignment is now CSS-only

### Why
The bio paragraphs used to be justified via a runtime JavaScript hack
(`markAboutContents` in `_includes/my-body.html`) that walked from
`#about` to `#news-notes`, attached an `about-contents` class to every
`<p>` between them, and re-attached it on every SPA navigation. After
the Kramdown heading conversion the `id="about"` was being eaten by
`titles_from_headings`, so the JS short-circuited and the bio stopped
being justified.

### What
- `index.md` — the four bio paragraphs are wrapped in
  `<div class="bio-text" markdown="1">…</div>`. The `markdown="1"`
  attribute is Kramdown's "still parse the inner content as Markdown"
  hint, so all the inline links keep working.
- `_includes/my-head.html` — `p.about-contents` rule replaced with
  `.bio-text p { text-align: justify }`.
- `_includes/my-body.html` — entire `markAboutContents` function plus
  its DOMContentLoaded / hy-push-state listeners deleted.

### Watch out
- The justify scope is exactly the four paragraphs inside `.bio-text`.
  News block, body-social row, talks list, miscellanies bullets — none
  of them have `.bio-text` as ancestor, so they're untouched. If you
  add another paragraph that should be justified, place it inside the
  same wrapper (or add another `.bio-text` block).

---

## 2026-05 · Markdown headings + page-title hygiene

### Why
The hand-crafted `<h2 class="h1 index-header" id="…">…</h2>` blocks in
`index.md` were ugly to maintain. Kramdown supports the same idiom via
its IAL syntax. But moving to real Markdown headings caused the
`jekyll-titles-from-headings` plugin to auto-promote the first one
("Short Bio") into `page.title`, which leaked into `<title>`,
`og:title`, AND the auto-updated footer copyright (which parses
`document.title.split('|')[0]`).

### What
- `index.md` — every `<h2>` block converted to:

  ```markdown
  ## Section Title
  {:.h1 .index-header #section-id}
  ```

  Same render output, declarative source.
- `_includes/disclaimer.html` — the DISCLAIMER heading now lives here
  with the same class+id, so it's styled the same on 404 / LICENSE /
  every page.
- `index.md` front matter — `title:` set to `""` (explicit empty
  string, NOT bare `title:` which is null). The
  `jekyll-titles-from-headings` plugin's gate is
  `return false if document.data["title"]` — Ruby treats `""` as truthy,
  so the plugin bails out and leaves `## Short Bio` alone. `id="about"`
  stays in the body for the sidebar About link, jekyll-seo-tag falls
  back to the homepage format `site.title | site.tagline`, and the
  footer-info JS extracts "Donny Y. Chen" from `document.title`.

### Watch out
- "Short Bio" is the first `<h2>` on the homepage. If you rearrange
  `index.md` so a different heading lands first AND remove the
  `title: ""` front-matter key, the new heading will become the page
  title. The empty-string title is what shields against this — keep it.
- Kramdown IAL pattern reminder:
  - Class on a paragraph: write text, then `{:.classname}` on the next line.
  - Multiple classes / id: `{:.class1 .class2 #idname}`.
  - Attribute on an inline link: `[text](url){:attr="value"}` immediately after the link.
  - Literal `*` at the start of a paragraph: escape with `\*`.

---

## 2026-05 · Publication author row polish: owner color, comma color, hover underline

### Why
After the publications + co-authors refactor, the author row's
`<b>Donny Y. Chen</b>` rendered in `--bright-color` (the row tone) along
with the rest of the line. The user wanted the owner's name in the
title color, every co-author hover to surface a thin underline as a
clickability cue, and the comma directly after the owner's name to
inherit the same color as the name (not the row tone).

### What
- `_includes/my-head.html`:
  - `.pub-authors b { color: var(--body-color) }` — owner name picks
    up the same color as `.pub-title` (which has no explicit color and
    inherits body color).
  - `.content .pub-authors a.coauthor:hover { text-decoration:
    underline; text-decoration-thickness: 1px; text-decoration-color:
    var(--bright-color); ... }` — thin underline on hover, color
    explicitly pinned to `--bright-color` (i.e. matches the name).
    `.content` prefix is needed because Hydejack's
    `.content a:not(.btn):not(.no-hover):hover` rule has specificity
    (0,4,1) and wins over a (0,3,1) rule on source-order ties — adding
    `.content` brings ours up to (0,4,1) and source order then favors
    the inline `<style id="_styleInline">` block.
- `_includes/publications.html` — when emitting the owner token, splice
  `,` BEFORE the closing `</b>` if not the last author, so the comma
  ends up inside the bold and inherits the owner color. The join logic
  tracks an `owner_carries_comma` flag and emits a single space (no
  comma) before the next piece on the iteration immediately after the
  owner.

### Watch out
- The owner-color logic also kicks in for legacy entries that hand-wrap
  the owner with `<b>…</b>` — the splice uses `replace: '</b>',
  ',</b>'` which is order-stable.
- `text-decoration-color: currentColor` was insufficient because the
  Hydejack rule wins on specificity and overrides it. Don't drop the
  explicit `var(--bright-color)` on the hover rule.

---

## 2026-05 · Projects & Talks moved to a data file

### Why
The "Projects & Talks" section in `index.md` was a hand-crafted `<ul>`
of invited talks plus 8 `<div class="card">` thumbnails — same HTML
repeated each time we wanted to add a talk or a video. Hard to
maintain, easy to typo.

### What
- `_data/projects.yml` — two top-level keys, `talks` (text-only list)
  and `cards` (image + description grid). Schema in the file's header.
  The previously-commented WAYVE entry is preserved as a YAML comment
  in its original list position.
- `_includes/projects.html` — Liquid template that renders the `<ul>`
  and `.demo-proj-row` blocks. Each talk supports an optional `host`
  block (drop the "hosted by …" tail when absent); each card supports
  an optional inline `style` attribute on the image wrapper so unusual
  aspect ratios can still get vertical padding.
- `index.md` — both blocks collapsed to a single
  `{% raw %}{% include projects.html %}{% endraw %}`.

### Watch out
- Verified byte-for-byte against the pre-refactor production build (git
  stash + diff). Do not "improve" the surrounding whitespace in the
  include — Hydejack's compress_html is tuned to the exact output and
  any change in the template body needs a fresh diff before declaring
  it equivalent.
- The first talk's title carries a literal U+200B zero-width space
  after "Inputs" (legacy from the source copy-paste). The YAML
  preserves it; if it ever needs to go, edit the YAML directly.

---

## 2026-05 · Publications + co-authors moved to data files

### Why
The 9 active publication blocks in `index.md` were hand-crafted HTML —
title, venue, author row, link badges, "also presented at" callouts,
GitHub stars badges, highlight chips, all repeated. Adding a new paper
meant copy-pasting and remembering every formatting convention. We also
wanted every co-author auto-linked to a real homepage when known, with
a sensible fallback otherwise, and the homepage owner ("Donny Y. Chen"
/ "Yuedong Chen") auto-bolded.

### What
- `_data/publications.yml` — list-of-mappings, newest at the top. Each
  entry has title / venue / authors (plain comma-separated, no `<b>`,
  no "and"), a links array, and an optional `extra`. The file's header
  documents the schema.
- `_data/coauthors.yml` — flat name-to-URL map. Listed names get that
  URL; missing names fall back to a Google search for the name.
- `_data/authors.yml` — `author2` simplified to a single
  `name: Yuedong Chen` so the include treats both Donny Y. Chen
  (author1) and Yuedong Chen (author2) as the homepage owner.
- `_includes/publications.html` — Liquid template that builds each
  `.pub` block. Tokenizes `authors` on ", "; auto-bolds owner names;
  auto-prepends "and " before the last author when there are >1; passes
  through tokens that already carry inline HTML (so an intentional
  `<i>et al.</i>` elision is preserved); wraps every other token in
  `<a class="coauthor" target="_blank" …>`.
- `_includes/my-head.html` — `.coauthor` styling so the link inherits
  the author-row color and drops the underline.
- `index.md` — the entire publication section is now a single
  `{% raw %}{% include publications.html %}{% endraw %}`.
- Commented-out historical papers (MuRF, ObjectSDF, Causal Emotion,
  GeoConv, FMPN-FER) are kept as YAML comments at their original list
  positions so they can be uncommented later.

### Watch out
- Compress_html clips the regular space between text-and-tag boundaries
  (e.g. between `]` and `<a>`). The link badge row is separated by
  `&nbsp;` instead of `" "` specifically because of that pass; if you
  swap it back to `" "` the brackets will run together in the
  production build but render fine in development.
- Tokens in `authors` that contain any `<` are treated as already-
  tagged and emitted verbatim. That is what makes `<i>et al.</i>` pass
  through. If you ever need a co-author whose display name legitimately
  contains `<`, you'll have to amend the include.
- Owner detection comes from `site.data.authors`. If you publish under
  a third name, add an `author3:` block with `name: …` to
  `_data/authors.yml` — the include picks it up automatically.

---

## 2026-05 · Body-social row pulled into a Liquid include

### Why
The 7-link social row in `index.md` was hand-crafted HTML duplicating
the data already in `_data/authors.yml` (which the sidebar reads).
Adding/removing/renaming a social account meant editing two places and
remembering to keep them in sync.

### What
`_includes/body-social.html` — small Liquid loop over
`site.data.authors.first[1].social`. For each platform it looks up the
icon class, display name, and URL prefix from `site.data.social[platform]`
(the same `_data/social.yml` that the upstream
`components/social-list-item.html` uses for the sidebar). Output
mirrors the previous hand-crafted markup with two body-social-specific
flourishes preserved: `target="_blank"` and a visible label next to
each icon.

`index.md` now just includes `body-social.html` via the Liquid
`{% raw %}{% include … %}{% endraw %}` tag.

### Watch out
- Adding/removing a social account is a one-line edit to
  `_data/authors.yml` and propagates to BOTH the sidebar (icon-only)
  and the body-social row (icon + visible label). Don't edit `index.md`
  for that anymore.
- The visible label comes from `_data/social.yml` `name:` per platform —
  currently "Twitter" and "BlueSky" by default. Override those if you
  want different display text; the sidebar tooltip changes too in
  lockstep.

---

## 2026-05 · Project & Talk card images: uniform 4:3 + separator line

### Why
Source thumbnails have slightly different aspect ratios (1731×1269,
2056×1508, 1024×751, 3129×2347, …). Without a fixed slot, cards
rendered at different heights and the row looked uneven. Also the image
touched the title text directly, so users wanted a thin separator that
works in BOTH light and dark mode.

### What
`_includes/my-head.html` `.card img`:
- `aspect-ratio: 4 / 3` (most thumbnails are already ~1.33).
- `object-fit: cover; object-position: center` (anything that doesn't
  match 4:3 gets center-cropped, never letterboxed).
- `border-bottom: 1px solid color-mix(in srgb, var(--body-color) 12%, transparent)`.
  12% body-color over the 2.5% card tint = a subtle gray line in BOTH
  modes. No hard-coded color, no per-mode override needed.

### Watch out
- If a future thumbnail's important content sits near the top or bottom
  and gets cropped, switch `object-position` to `center top` or
  `center bottom` per-image rather than changing the global rule.
- The 4:3 ratio is appropriate for current talk thumbnails. If we add a
  wide 16:9 image with critical content near the edges, either re-shoot
  the thumbnail at 4:3 or change the global ratio and re-probe ALL
  cards.

---

## 2026-05 · Project & Talk cards adopt the hydejack.com/showcase block style

### Why
User wanted the `.demo-proj-row > .card` blocks to match the look of
the upstream showcase cards on <https://hydejack.com/showcase/>, but
keep existing text color/weight/font.

### What
`_includes/my-head.html` `.card` (and the mobile media-query variant):
- `background: color-mix(in srgb, var(--body-color) 2.5%, transparent)`
  so the subtle tint flips automatically with light/dark mode (matches
  showcase's `rgba(0,0,0,0.024)` light + `rgba(255,255,255,0.03)` dark
  by deriving from `--body-color`).
- `border:` removed (was 1px solid).
- `border-radius: 8px` + `overflow: hidden` so the image's top corners
  round flush with the card edge.
- `box-shadow: 2px 2px 16px rgba(0,0,0,0.2)` (matches showcase's offset
  + blur). Mobile uses a tighter `1px/8px` variant.
- `padding-bottom: 16px` (was 10px) → ~12px on mobile.
- transition timing 0.5s instead of 0.3s.

`.card img` gets `border-radius: 8px 8px 0 0` so it tucks into the
card's rounded top corners.

### Watch out
Don't switch `background-color` back to `var(--body-bg)` — that would
make the card invisible against the page background. The whole point is
the subtle tint that contrasts both light AND dark.

---

## 2026-05 · iPad orientation: portrait → mobile_cover, landscape → desktop_cover

### Why
User intent: `desktop_cover` applies to desktop AND iPad in landscape;
`mobile_cover` applies to phone AND iPad in portrait. iPad portrait
widths (768–1024 across iPad mini, iPad, iPad Air, iPad Pro 11/12.9)
and landscape widths (1024–1366) overlap at 1024 — a width-only
breakpoint can't disambiguate. iPad Pro 12.9 portrait is exactly
1024×1366; without orientation it falls into `desktop_cover` by
mistake.

### What
- `_includes/body/index.html` JS DESKTOP_MQ:
  `(min-width: 64em) and (orientation: landscape)`.
- `_includes/my-head.html` matching `@media` in BOTH the global
  widening block and the cover-block (so JS lock + CSS revert agree).

### Watch out
The Hydejack theme itself uses `(min-width: 64em)` (no orientation) in
its core CSS. Our overrides happen to win via `!important` and inline-
style locks, but the THEME's drawer position would still be
`position: fixed; width: 21rem` on iPad Pro 12.9 portrait. Our JS no
longer applies its lock there, and our CSS `width: 24rem` override no
longer matches — so the drawer falls back to Hydejack's 21rem fixed
positioning on iPad Pro 12.9 portrait specifically. We don't currently
revert that. If the cover hero is needed there, extend `my-head.html`
with an `(orientation: portrait) and (max-width: 80em)` rule that
pushes drawer to mobile-cover layout even at 1024-1366 portrait widths.

---

## 2026-05 · Visitor-map extracted to a reusable include

### Why
Tracker rendered only on the homepage because the markup was inline in
`index.md`. To get the map on every page (including `404.html`, license
pages, future posts) we extracted it.

### What
- `_includes/visitor-map.html` — div placeholder + deferred loader
  (same defensive pattern as before: `requestIdleCallback` after
  `window.load` + idempotency guard + 5s hide-on-fail timeout).
- `_includes/body/footer.html` — project shadow of Hydejack's footer,
  prepends `{% raw %}{% include visitor-map.html %}{% endraw %}` above
  the upstream footer markup. `body/main.html` (theme) calls
  `body/footer.html` on every page, so the visitor-map ships
  everywhere.
- `index.md` no longer carries the visitor-map block.

### Watch out — the recursive-include trap
Liquid processes tags INSIDE HTML `<!-- -->` comments. So a
`visitor-map.html` that documented itself with an HTML comment
containing `{% raw %}{% include visitor-map.html %}{% endraw %}`
triggered an infinite include chain (Liquid stack overflow at build
time). Use Liquid's own `{% raw %}{% comment %} … {% endcomment %}{% endraw %}`
block for any docs inside an include — those are stripped before tag
evaluation. HTML comments are NOT a barrier against Liquid.

---

## 2026-05 · Offline support (homemade service worker, NOT Hydejack PRO)

### Why
Hydejack's docs document an `offline.enabled` config flag — but offline
support is PRO-only (confirmed via three checks: the free theme's
README marks it PRO, the free theme ships zero
`navigator.serviceWorker.register` code, and `/assets/js/sw.js` is not
in the free bundle though the PRO demo at hydejack.com serves it). The
config slot in our `_config.yml hydejack.offline.*` is therefore inert
in the free version — flipping `enabled: true` alone does nothing. We
rolled a custom SW.

### What
- `assets/js/sw.js` (Liquid-templated) is the SW source. `permalink:
  /sw.js` forces Jekyll to publish it at the site root because a
  service worker's default scope = the directory it's served from, and
  only a root-served `sw.js` can intercept fetches for the whole site.
  (GH Pages doesn't allow the `Service-Worker-Allowed` header that
  would let us widen scope from a subdir.)
- `_includes/my-body.html` has a deferred registration block, gated by
  `{% raw %}{% if site.hydejack.offline.enabled %}{% endraw %}`, that
  runs via `requestIdleCallback` after `window.load` (same defensive
  pattern as the deferred clustrmaps loader — a slow / failed
  registration can never block rendering or Hydejack's drawer init).
- `_config.yml` flips `offline.enabled: true` and bumps `cache_version`.
- Cache name is `donydchen-v<cache_version>-<build_time>`. The activate
  handler deletes any cache prefixed with `donydchen-` that isn't the
  current name → bumping `cache_version` OR a content rebuild both
  invalidate.
- Strategy split: `/assets/*` is cache-first (assets are
  build-versioned by filename, can live "forever"); HTML is
  network-first with cache fallback so visitors always see fresh
  content online but still get cached pages offline.
- Never-cache list (in `NEVER_CACHE_PATTERNS`): the SW itself, sitemap,
  feed, redirects.json, robots.txt, and:
  - `/assets/videos/` — ~27 MB at last build, far over iOS Safari's
    per-origin SW budget.
  - `/matchnerf/`, `/mvsplat/`, `/mvsplat360/`, `/sem2nerf/` —
    unrelated project sub-sites hosted under this domain (~110 MB
    combined). Not part of the homepage; not needed offline.
- Cross-origin requests (clustrmaps, Google Fonts, etc.) bypass the SW
  entirely — the deferred clustrmaps loader's `onerror` still fires
  when the visitor blocks the tracker.

### Watch out
- Don't add `register()` to a `<script>` block that runs before the
  critical render path. Use the deferred pattern in `my-body.html`.
- Don't move `sw.js` OUT of the site root output. Putting it under e.g.
  `/assets/js/sw.js` (without using a `permalink: /sw.js` front-matter
  redirect) restricts SW scope to that subdir — caching nothing useful.
  Source can live anywhere; OUTPUT must end up at `/sw.js`.
- Don't list large or unrelated assets in `PRECACHE_URLS`. iOS Safari
  has a small per-origin budget; a single overweight precache fails the
  whole `addAll` batch. We use individual `cache.add` with `.catch()`
  to make it tolerant.
- When the user updates content but doesn't bump `cache_version`, the
  `BUILD_TIME` tag still rotates the cache name → invalidation is
  automatic. `cache_version` is only needed for "force every visitor to
  evict everything immediately" scenarios.

---

## 2026-05 · ORCID added + sidebar widened to fit 7 icons everywhere

### Why
Adding ORCID brings the sidebar social row to 7 icons (Email, Google
Scholar, ORCID, GitHub, LinkedIn, Bluesky, X). Each icon is 3rem (48px)
wide. Hydejack's default `.sidebar-sticky { max-width: 21rem; padding:
1.5rem }` leaves only 18rem of inner room → 6 icons exactly → 7th wraps
to a second row.

### What
- `_data/authors.yml`: uncomment the `orcid:` line.
- `_includes/my-head.html`:
  - `.sidebar-sticky { max-width: 24rem }` set GLOBALLY (no
    breakpoint) so mobile cover hero also fits 7 icons down to a
    ~375px iPhone SE.
  - At 64em+ : hy-drawer / `body::before` / `.content-margin` all
    widened to match (24rem / 24rem / 28rem).
  - At 104em+ : same dimensions at 31.5rem (= 1.5x default) /
    35.5rem `.content-margin`. The 31.5rem widening also reduces the
    empty right-side space that wide monitors leave.
- `_includes/body/index.html`: JS `DESKTOP_LOCK` simplified to
  position-only properties (width / peek-width are now CSS-driven
  responsively, so `DESKTOP_LOCK_WIDE` and the second `matchMedia`
  listener are no longer needed).

### Watch out
- Hydejack's `_styleInline` (production-mode critical-CSS block)
  contains `hy-drawer.cover { width: 100% }`. Our override needs
  `!important` on `hy-drawer` to beat it.
- `body::before` is pinned to match the widened sidebar so Hydejack's
  `calc(50% - half-content)` rule at ≥104em can't overshoot and
  reintroduce the half-transparent rectangle bug in dark mode (see
  entry "wide-desktop side panel widening" below).

---

## 2026-05 · clustrmaps deferred so blocking/hung tracker can't stall page

### Why
Original embed was a synchronous `<script src="//cdn.clustrmaps...">`
inside `<div class="container">` — render-blocking. When the CDN was
slow the parser stopped, Hydejack's drawer JS never initialised, and
the sidebar visibly froze. Then we tried gating with
IntersectionObserver, which fixed the freeze but undercounted visitors
who didn't scroll to the bottom.

### What
`index.md`: defer load with `requestIdleCallback` (3s timeout) +
`window.load` + `script.async = true` + an idempotency guard
(`if (document.getElementById('clustrmaps')) return`). `script.onload`
clears a `done` flag; `script.onerror` and a 5s `setTimeout` hide the
empty 300x200 placeholder if the request fails or hangs (uBlock /
Pi-hole / sinkhole DNS / very slow CDN).

### Verified
With the script BLOCKED via Puppeteer request interception, and again
with the request HUNG (never responds), every other piece of content —
drawer, sidebar, publications, project cards — renders identically and
on time. The hung scenario is actually faster than the success case
because the browser puts zero attention on the pending request.

### Watch out
Don't reintroduce a sync `<script src=…>`. Don't move the inject inside
the IntersectionObserver gate (we previously did and silently
undercounted visitors).

---

## 2026-05 · Wide-desktop side panel widened to 1.5× at ≥104em

### Why
On 1920px+ monitors the article column had ~600px of empty space on
the right, and the 21rem sidebar felt visibly narrow. Bump the side
panel to 31.5rem at break-point-dynamic (104em) and shift `.content`
right by the same delta so the article-to-sidebar gap stays at
content-margin-5 (4rem).

### Important
Below 104em we KEEP the 21rem default — narrow desktops (1280-1664px)
would otherwise squeeze the article column behind the widened sidebar.
(This is what "the sidebar widening fits the icon row everywhere" entry
above eventually generalised, with the `.sidebar-sticky` cap
independent of the drawer host width.)

### Half-transparent rectangle bug (do not regress)
Hydejack's `body::before` is a fixed-left bar tinted with `--gray-bg`
that's meant to mirror the visible sidebar. At ≥104em Hydejack lets it
grow to `calc(50% - half-content)`, which on wide monitors overshoots
the sidebar's right edge and shows as a faint half-transparent
rectangle in dark mode. Pinning `body::before` to the same width as the
(overridden) sidebar prevents the bleed.

---

## 2026-05 · Mobile cover stops reopening on iOS Safari address-bar resize

### Why
On iOS Safari the address bar collapses/expands during scroll, firing
`window.resize` on every transition. The cover-control IIFE used to
listen to `resize` directly, so every collapse re-ran `applyState()` —
and any time the user had already dismissed the cover,
`wantsCover && !opened` would call `drawer.open()` again and the cover
hero kept popping back up while they were trying to read the content.

### What
`_includes/body/index.html`: replace
`window.addEventListener('resize', applyState)` with
`matchMedia(DESKTOP_MQ).addEventListener('change', applyState)`.
`matchMedia` `'change'` only fires when the width-driven breakpoint
actually crosses, so iOS Safari address-bar height changes are
ignored. Verified across rapid 50× height-only resizes — drawer stays
in the user's chosen state, scroll position preserved.

### Important note for future changes
The `noscroll` attribute on `<hy-drawer>` only affects touch-gesture
`preventDefault()` in Hydejack — it does NOT lock body overflow. Body
IS scrollable past the cover hero on mobile. This matches upstream
`hydejack.com` behaviour exactly (verified by side-by-side Puppeteer
probe). If a future "fix" tries to lock body overflow here, you're
diverging from upstream and will reintroduce the "scrolling returns to
cover" perception bug.

---

## 2026-05 · Cover-control IIFE swallowed by compress_html in production

### Why
The cover-control IIFE in `_includes/body/index.html` used `//` line
comments. Hydejack's `compress_html` (only enabled when
`JEKYLL_ENV=production`, i.e. on GitHub Pages but NOT on local
`bundle exec jekyll serve`) strips newlines inside `<script>` blocks.
Without newlines, every `//` line comment ate the rest of the script —
`drawer.removeAttribute('opened')` never ran, and desktop showed the
cover hero instead of the side panel. "Works on my machine; broken in
prod" is the diagnostic signature.

### What
1. Switch every comment inside the IIFE (and any future inline script
   in this repo) to block comments `/* … */`.
2. Set position/width/peek-width as inline styles via
   `setProperty(prop, value, 'important')` so the lock always wins
   regardless of CSS load order or where Hydejack's production-mode
   `<style id="_styleInline">` critical CSS lives in the cascade.
3. Re-evaluate on resize so crossing the breakpoint flips between
   cover and side-panel correctly, including syncing the `opened`
   attribute via the drawer's API once the custom element has
   upgraded.

### Rule of thumb
NEVER use `//` line comments inside an inline `<script>` in this repo.
Block comments only. (CLAUDE.md repeats this; treat it as
load-bearing.)

---

## 2026-05 · Per-viewport cover control (initial implementation)

### What
Added `desktop_cover` and `mobile_cover` per-page front-matter flags.
The implementation uses Hydejack's existing `cover` layout machinery
rather than forking the theme:

1. `_includes/body/index.html` overrides Hydejack's body wrapper to set
   `effective_cover = desktop_cover OR mobile_cover` and passes that to
   `body/sidebar.html`. So the cover-class drawer + `opened` attribute
   are emitted whenever EITHER flag is true.
2. `_includes/my-head.html` reverts the `.cover` styling on the
   viewport whose flag is FALSE:
   - `desktop_cover=false` → `hy-drawer.cover` pinned position-fixed at
     sidebar-width with locked peek-width (looks like the standard
     non-cover side panel; `#_menu` still slides the cover in/out via
     the drawer's native translateX).
   - `mobile_cover=false` → `hy-drawer.cover` on mobile gets peek-width
     0 so the closed state hides the cover entirely; user accesses the
     drawer via the menu button.
3. A small inline IIFE removes the `opened` attribute on the viewport
   that doesn't want cover, so the drawer starts in the right state
   before Hydejack's drawer module upgrades it.

### Why this approach
No theme modification, no re-publishing of a forked Hydejack — just
project-level CSS + a tiny pre-upgrade JS shim.
