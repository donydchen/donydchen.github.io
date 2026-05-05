# Hydejack v9.2.1 — Internal Structure (reference)

A field guide to the upstream theme so we can override or extend it
without breaking it. Sourced from a read of <https://github.com/hydecorp/hydejack>
at tag `v9.2.1` (the version this repo's `_config.yml` pins via
`remote_theme: hydecorp/hydejack@v9.2.1`).

This file is **read-only knowledge about the theme**. We don't ship any
of it; we just need to know what's there to know what's safe to touch.
The local `hydejack/` directory at the repo root is a gitignored clone
for browsing — Jekyll never reads it.

---

## 1. Repository layout (theme)

```
hydejack/
├── _config.yml             # theme defaults: title, accent_*, theme_color,
│                            #  hydejack.* feature flags, dark_mode block
├── _layouts/               # 12 layouts; cascade described in §2
├── _includes/
│   ├── head/               # everything that goes in <head>
│   ├── body/               # everything that goes in <body>
│   ├── components/         # reusable UI (post, social, post-list-item, …)
│   ├── templates/          # hidden <template> stubs for SPA features
│   ├── styles/             # SCSS entrypoints compiled at build time
│   ├── scripts/            # tiny inline JS shims (load-js, load-css, …)
│   ├── pro/                # PRO-only includes
│   ├── smart-url/          # URL helper (relative_url + http(s) passthrough)
│   ├── if-non-null/        # tiny tag that no-ops if its `try` include is missing
│   ├── base-classes        # builds <body class="…"> from hydejack feature flags
│   ├── header.txt          # ASCII-art comment that ships in every page
│   ├── icon-github.html    # static SVG used by some PRO components
│   ├── my-head.html        # USER OVERRIDE SLOT — extra <head> content
│   ├── my-body.html        # USER OVERRIDE SLOT — trailing <body> scripts
│   ├── my-scripts.html     # USER OVERRIDE SLOT — extra <script> tags
│   └── my-comments.html    # USER OVERRIDE SLOT — comments-section override
├── _sass/
│   ├── _variables.scss     # legacy color/text vars ($body-bg, $border-color, …)
│   ├── _mixins.scss        # SCSS mixins (color-transition, ellipsis, etc.)
│   ├── _reboot-mod.scss    # Bootstrap reboot, modified
│   ├── _syntax.scss        # syntax highlighting palette
│   ├── _spinner.scss       # loading spinner styles
│   ├── _tippy.scss         # tooltip wrapper (uses tippyjs/)
│   ├── html.scss           # exposes SCSS vars as CSS custom properties on :root
│   ├── hydejack/           # theme-specific styles, split into __inline__/__link__
│   ├── pooleparty/         # poole/lanyon styles (post, code, type, footer, …)
│   ├── tippyjs/            # tooltip animations + vars
│   ├── pro/                # PRO-only styles (dark-mode-dynamic, syntax-dark, …)
│   ├── my-variables.scss   # USER OVERRIDE SLOT
│   ├── my-inline.scss      # USER OVERRIDE SLOT
│   └── my-style.scss       # USER OVERRIDE SLOT
├── _js/
│   ├── src/                # source modules (rxjs-based) — built by webpack
│   │   ├── entry.js        # progressive feature-detected loader
│   │   ├── upgrades.js     # tippy, code-block enhance, MathJax bridge
│   │   ├── drawer.js       # the side-drawer logic (cover-mode lives here)
│   │   ├── push-state.js   # SPA navigation
│   │   ├── navbar.js       # auto-hide navbar
│   │   ├── common.js       # shared helpers, browser detection, CSS-prop reads
│   │   ├── clap-button.js  # PRO-style "clap" widget
│   │   ├── cross-fader.js  # sidebar BG cross-fade
│   │   ├── flip/, polyfills/, pro/
│   │   └── languages.json
│   └── lib/                # third-party shims (modernizr-custom, version)
├── assets/                 # compiled output that ships to consumers:
│   ├── js/hydejack-9.2.1.js              # main module bundle (entry.js)
│   ├── js/LEGACY-hydejack-9.2.1.js       # nomodule fallback
│   ├── js/drawer-hydejack-9.2.1.js       # async-imported drawer chunk
│   ├── js/push-state-hydejack-9.2.1.js   # async-imported push-state chunk
│   ├── js/navbar-hydejack-9.2.1.js       # async-imported navbar chunk
│   ├── js/vendors~drawer-hydejack-9.2.1.js  # @hydecorp/drawer custom element
│   ├── js/vendors~push-state-hydejack-9.2.1.js
│   ├── css/hydejack-9.2.1.css            # main stylesheet (compiled style.scss)
│   ├── icomoon/                          # icon font + CSS
│   └── img/                              # default sidebar bg, swipe SVG, …
├── webpack.config.js
├── package.json            # @hydecorp/component, @hydecorp/drawer, rxjs, tippy.js, …
└── jekyll-theme-hydejack.gemspec
```

The version number is encoded into bundled filenames (`hydejack-9.2.1.js`,
`hydejack-9.2.1.css`). Bumping the theme version means new asset paths.

---

## 2. Layout cascade

The free theme ships 12 layouts; all ultimately resolve to `compress`.
`front-matter > layout` of any page picks one of the leaf layouts; each
leaf inherits from `base`, which inherits from `compress`.

```
compress.html   ← root: <!DOCTYPE>, <html>, runs whitespace/comment/clipping
                  stripper UNLESS jekyll.environment is in
                  site.compress_html.ignore.envs (default: [development]).
   │
   └── base.html ← assigns `author`, `image`, `color`, `theme_color`;
                    emits <head>{% include head/index.html %}</head>
                    and <body class="{% include base-classes %}">{% include body/index.html %}</body>.
        │
        ├── default.html  ← just outputs `{{ content }}`
        │     ├── plain.html       (just renders content; used by the homepage)
        │     ├── post.html        (post + dingbat + addons: about/related/comments)
        │     ├── page.html        (h1 + description + content + dingbat + comments)
        │     ├── about.html       (h1 + author swap-in + content + dingbat + comments)
        │     ├── home.html        (lists posts + html_pages)
        │     ├── blog.html        (paginated post list)
        │     ├── list.html        (filtered list)
        │     ├── not-found.html   (404)
        │     └── redirect.html    (meta-refresh)
        │
        └── (compress-only consumer)
```

PRO-only leaf layouts (referenced in upstream docs but absent from the
free version):

- `project.html`     — single project page; expects `_projects/<slug>.md`
                       collection items with front-matter `date`, `image`,
                       `caption`, `description`, `links`, `featured`.
- `projects.html`    — gallery view of the `_projects/` collection.
- `resume.html`      — JSON-Resume-format CV; data from
                       `_data/resume.yml` or `_data/resume.json`. Front-matter
                       `left_column`, `right_column`, `buttons`, `no_skill_icons`,
                       `no_language_icons`.
- `welcome.html`     — landing page; supports HTML markers `<!--projects-->`,
                       `<!--posts-->`, `<!--posts_list-->` for inline embeds.
- `grid.html`        — grid variant of `list` for category/tag pages.

Setting `layout: project` etc. in the free theme will fall through to
`default.html` (Jekyll's default-layout plugin) or 404, depending on
plugin order. **Don't pick a layout name without checking it exists.**

Implications for overrides:

- **Adding HTML to every page** → override `_includes/my-head.html` (or
  `_includes/my-body.html` for trailing scripts).
- **Replacing the body composition** (sidebar/menu/main order) → override
  `_includes/body/index.html` — the file we already shadow in this repo.
- **Adding head elements only on certain layouts** → use `{% if page.layout == 'plain' %}`
  in `my-head.html`.

---

## 3. `body/index.html` — the body composition

This is the single most important file for layout overrides. The upstream
content is:

```liquid
{% include_cached pro/dark-mode-fix.html %}     ← inline color-mode FOUC fix

{% assign assets_url = "/assets/" | relative_url %}
<hy-push-state
  id="_pushState"
  replace-selector="#_main"          ← only #_main is swapped on SPA nav
  link-selector="a[href]:not([href^='{{ assets_url }}']):not(.external):not(.no-push-state)"
  script-selector="script"           ← scripts inside #_main re-execute on nav
  duration="500"
  hashchange
>
  {% capture sidebar %}{% include_cached body/sidebar.html
        cover=page.cover invert=page.invert_sidebar
        theme_color=page.theme_color image=image color=color %}{% endcapture %}
  {% if page.cover %}{{ sidebar }}{% endif %}    ← cover layout: sidebar BEFORE main
  {% include_cached body/menu.html %}
  {% include body/main.html %}
  {% unless page.cover %}{{ sidebar }}{% endunless %}  ← non-cover: sidebar AFTER main
</hy-push-state>

{% unless page.redirect %}
  {% include_cached body/scripts.html %}
  {% include my-body.html %}
{% endunless %}

{% include_cached templates/index.html %}     ← hidden <template> elements for SPA
```

Key points:

- `<hy-push-state>` is a custom element. Internal links inside it trigger
  partial-page loads that swap `#_main`. Sidebar / menu / footer survive
  navigation.
- `link-selector` excludes `/assets/...` URLs and anything tagged `.external`
  or `.no-push-state` from SPA navigation.
- `script-selector="script"` makes scripts inside `#_main` re-execute on every
  navigation; scripts OUTSIDE `#_main` run once per full page-load only.
- The cover-vs-non-cover branch is **purely DOM order**. Hydejack uses CSS
  + the `.cover` class on `<hy-drawer>` to render either layout from the same
  underlying markup.

Our project override (`_includes/body/index.html` in this repo) keeps this
structure verbatim and only adds:

1. an `effective_cover = page.desktop_cover OR page.mobile_cover` shim before
   the include of `body/sidebar.html`;
2. a tiny inline IIFE that runs before the drawer module upgrades, syncing
   the `opened` attribute and applying inline-style locks for the viewport
   that doesn't want cover.

If `body/index.html` ever changes upstream we need to re-merge.

---

## 4. `body/sidebar.html` — the drawer

```liquid
<hy-drawer
  id="_drawer"
  class="{% if include.cover %}cover{% endif %}"
  side="left"
  threshold="10"
  noscroll                                 ← TOUCH preventDefault flag, NOT body-overflow lock
  {% if include.cover %}opened{% endif %}
>
  <header id="_sidebar" class="sidebar{% if include.invert %} invert{% endif %}">
    {% include_cached body/sidebar-bg.html … %}     ← <div class="sidebar-bg sidebar-overlay">
    {% include_cached body/sidebar-sticky.html %}   ← .sidebar-sticky inner column
  </header>
</hy-drawer>
```

`.sidebar-sticky` is the inner content column. Its max-width caps the visible
content area:

```scss
.sidebar-sticky {
  position: relative;
  z-index: 3;
  max-width: $sidebar-width;     // = 21rem by default
  padding: 1.5rem;
  contain: content;
}
```

`.sidebar-sticky > .sidebar-about` (avatar + name + tagline),
`.sidebar-sticky > nav.sidebar-nav` (top-level nav from `site.menu`), and
`.sidebar-sticky > .sidebar-social` (icon row from `_data/authors.yml`'s
`social:`) are stacked vertically.

`noscroll` is decoded by `@hydecorp/drawer` (see vendors bundle): it makes the
custom element call `event.preventDefault()` on horizontal touchmoves so the
swipe gesture and body scroll don't fight. **It does NOT lock body
overflow.** The body remains scrollable even while the drawer is opened in
cover mode — confirmed by direct comparison against the official
`hydejack.com` demo.

`opened` is a reflective attribute on the custom element. The drawer JS reads
it on upgrade to seed initial state.

---

## 5. `body/menu.html` — the navbar

```liquid
<div id="_navbar" class="navbar fixed-top">
  <div class="content">
    <div class="nav-btn-bar">
      <a id="_menu" class="nav-btn no-hover" href="#_drawer--opened">
        <span class="icon-menu"></span>
      </a>
      <div class="nav-span"></div>
    </div>
  </div>
</div>
```

Just one button — the hamburger that toggles the drawer. The `href="#_drawer--opened"`
is a no-op for hash navigation; the actual toggle is wired in `drawer.js`:

```js
document.getElementById('_menu')?.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  drawerEl.toggle();
});
```

When the drawer is in **cover** state on mobile, the cover content (`.sidebar-bg`)
sits at z-index above the navbar (drawer z-index = 4). A click at the menu's
coordinates hits the cover, not the menu. This is intended UX — dismiss via
swipe / swipe-icon, not via the menu — and matches the upstream demo.

---

## 6. `head/index.html` — the head composition

Includes are resolved in this exact order. Anything site-specific belongs in
`my-head.html`, which always runs LAST:

```liquid
{% include        head/meta.html %}            ← color-scheme, theme-color, robots, SEO
{% include_cached head/meta-static.html %}     ← charset, viewport, app titles, generator
{% include        head/links.html lang=page.lang %}     ← rel=stylesheet (or preload)
{% include_cached head/links-static.html %}    ← favicon, manifest, dns-prefetch, swipe SVG preload
{% include_cached head/scripts.html %}         ← defines window.loadJS / loadCSS / setRel
{% include_cached head/styles.html             ← see §7
                  layout=page.layout
                  color=color
                  theme_color=theme_color %}
{% include my-head.html %}                     ← USER OVERRIDE — runs last, wins on cascade
```

`head/scripts.html` also writes feature flags onto `window`:

```js
w._baseURL    = '<site-baseurl>/';
w._publicPath = '<baseurl>/assets/js/';
w._noPushState= site.hydejack.no_push_state;
w._noDrawer   = site.hydejack.no_drawer;
w._noNavbar   = site.hydejack.no_navbar;
w._noToc      = site.hydejack.no_toc;
w._noSearch   = site.hydejack.no_search;
w._search     = { DATA_URL, STORAGE_KEY, INDEX_KEY };
w._clapButton = site.clap_button or non-prod;
```

These are read by `entry.js` to decide which feature chunks to dynamically
import.

---

## 7. CSS pipeline — critical inlining + post-load full sheet

Hydejack splits each component's SCSS into two parts and then assembles two
artefacts:

| Artefact                                  | Which @imports               |
|-------------------------------------------|------------------------------|
| `<style id="_styleInline">…</style>` (inline) | `__inline__/*` partials        |
| `/assets/css/hydejack-9.2.1.css` (link)   | `__link__/*` partials          |

The split is encoded inside each `_sass/hydejack/_*.pre.scss` and
`_sass/pooleparty/_*.pre.scss` file via `// <<< inline ... // >>>` and
`// <<< link ... // >>>` markers. A pre-build step (`__inline__/`,
`__link__/` directories) emits two filtered copies of every component.

Entrypoints in `_includes/styles/`:

| Entrypoint | What it produces |
|---|---|
| `inline.scss` | The `_styleInline` block (critical above-the-fold CSS, inlined into every page in production). Imports the `__inline__/*` filtered partials. |
| `style.scss`  | The full external `hydejack-9.2.1.css`. In production it imports the `__link__/*` partials only (since inline already shipped the rest). In development OR when `site.hydejack.no_inline_css` is true, it imports the original `.pre.scss` files (everything in one stylesheet, no inline). |
| `page-style.scss` | A small `<style id="_pageStyle">` block that exposes per-page CSS variables (`--accent-color`, `--accent-color-faded`, `--theme-color`, `--dark-mode-body-bg`, `--dark-mode-border-color`) computed from `page.accent_color` / `page.theme_color`. Skipped if `site.hydejack.no_page_style`. |
| `common.scss` | Tiny strings-localised CSS (e.g. `.note:before { content: '...' }`). Always emitted. |

The dispatcher `head/styles.html`:

```liquid
{% if site.hydejack.no_inline_css or jekyll.environment == 'development' %}
  {% include_cached head/styles-no-inline.html %}    ← plain <link rel="stylesheet">
{% else %}
  {% include_cached head/styles-layout.html %}       ← <link rel="preload"> + setRel swap
  {% include_cached head/styles-inline.html %}       ← inlined critical CSS
{% endif %}
{% unless site.hydejack.no_page_style %}
  {% include_cached head/page-style.html %}
{% endunless %}
```

So the production `<head>` order is:

```
<link rel="preload" as="style" href=".../hydejack-9.2.1.css" id="_stylePreload">
<link rel="preload" as="style" href=".../icomoon/style.css" id="_iconsPreload">
<link rel="preload" as="style" href="https://fonts.googleapis.com/...">
<script>setRel('_stylePreload'); setRel('_iconsPreload'); …</script>
<noscript><link rel="stylesheet" …></noscript>
<style id="_styleInline">… critical CSS inlined …</style>
<style id="_pageStyle">… per-page custom props …</style>
{% include my-head.html %}    ← OUR styles run AFTER everything above
```

Why this matters for our overrides:

- `my-head.html` is positioned **after** `_styleInline`, so plain CSS rules at
  same specificity will win on cascade source-order tie-break.
- But to beat selectors with higher specificity (e.g. Hydejack's
  `hy-drawer.cover { width: 100% }`), use `!important` or a more specific
  selector.
- **`compress_html` strips newlines inside `<script>` blocks in production.**
  Use `/* … */` block comments only — never `//` line comments — inside
  inline scripts in any include we ship.

---

## 8. SCSS variables (`_includes/styles/variables.scss`)

Defaults that drive the layout. Override via `site.data.variables` or
specific `site.*` keys in `_config.yml`:

| Variable | Default | Override key |
|---|---|---|
| `$root-font-size` | `15px` | `vars.root_font_size` |
| `$root-font-size-medium` | `16px` | `vars.root_font_size_medium` |
| `$root-font-size-large` | `17px` | `vars.root_font_size_large` |
| `$root-line-height` | `1.75` | `vars.root_line_height` |
| `$content-width` | `42rem` | `vars.content_width` |
| `$content-width-2` | `48rem` | `vars.content_width_2` |
| `$content-width-5` | `54rem` | `vars.content_width_5` |
| `$content-padding` | `1rem` | `vars.content_padding` |
| `$sidebar-width` | `21rem` | `vars.sidebar_width` |
| `$break-point-1` | `42em` | `vars.break_point_1` |
| `$break-point-2` | `54em` | `vars.break_point_2` |
| `$break-point-3` | `64em` | `vars.break_point_3` |
| `$break-point-4` | `72em` | `vars.break_point_4` |
| `$break-point-5` | `86em` | `vars.break_point_5` |
| `$break-point-font-large` | `124em` | `vars.break_point_font_large` |
| `$content-margin-3` | `3rem` | (not tunable) |
| `$content-margin-5` | `4rem` | (not tunable) |

Derived:

```scss
$half-content       = ($content-width-5 / 2) + $content-margin-5     // 31rem
$break-point-dynamic = $content-width-5 + (2 * $content-margin-5)
                       + (2 * $sidebar-width)                          // 104em (with 21rem sidebar)
```

`$break-point-dynamic` is the breakpoint at which the sidebar starts growing
dynamically (and `body::before` would otherwise bleed, see §11).

**Do not ship a project value of `vars.sidebar_width` unless every override
in `my-head.html` is also re-derived.** We currently override the sidebar
size in our own CSS rather than via `vars` to keep the SCSS-derived
`$break-point-dynamic` constant.

---

## 9. CSS custom properties on `:root` (`_sass/html.scss`)

All SCSS vars used by JS are re-exposed as CSS custom properties. JS reads
them via `getComputedStyle(document.documentElement).getPropertyValue(...)`
in `_js/src/common.js`:

```scss
html {
  --font-family: …;
  --font-family-heading: …;
  --code-font-family: …;
  --root-font-size: …;
  --root-font-size-medium: …;
  --root-font-size-large: …;
  --root-line-height: …;
  --font-weight: …;
  --font-weight-bold: …;
  --font-weight-heading: …;
  --content-width-5: …;
  --content-margin-5: …;
  --sidebar-width: …;
  --half-content: …;
  --break-point-3: …;
  --break-point-5: …;
  --break-point-dynamic: …;
}
```

JS modules read these to set up matchMedia and layout calculations:

```js
// _js/src/common.js
export const BREAK_POINT_3       = `(min-width: ${getProp('--break-point-3')})`;
export const BREAK_POINT_DYNAMIC = `(min-width: ${getProp('--break-point-dynamic')})`;
export const CONTENT_WIDTH_5     = parseFloat(getProp('--content-width-5'));
export const CONTENT_MARGIN_5    = parseFloat(getProp('--content-margin-5'));
export const DRAWER_WIDTH        = parseFloat(getProp('--sidebar-width'));
export const HALF_CONTENT        = parseFloat(getProp('--half-content'));
```

If we change the visible `$sidebar-width` via project CSS overrides, the JS
constants remain at the upstream default — we should make sure the override
doesn't depend on `DRAWER_WIDTH` matching the visible drawer.

---

## 10. JS architecture

### Bundles (in `assets/js/`)

| File | What it is | When it loads |
|---|---|---|
| `hydejack-9.2.1.js` | `entry.js` compiled as ES module | `<script type="module">` in `body/scripts.html` |
| `LEGACY-hydejack-9.2.1.js` | nomodule fallback bundle | `<script nomodule defer>` |
| `drawer-hydejack-9.2.1.js` | feature-detected dynamic import of `drawer.js` | webpack chunk loaded by entry.js when DRAWER_FEATURES are present |
| `vendors~drawer-hydejack-9.2.1.js` | `@hydecorp/drawer` custom element | loaded by drawer chunk |
| `push-state-hydejack-9.2.1.js` | dynamic import of `push-state.js` | webpack chunk loaded when PUSH_STATE_FEATURES are present |
| `vendors~push-state-hydejack-9.2.1.js` | `@hydecorp/push-state` | loaded by push-state chunk |
| `navbar-hydejack-9.2.1.js` | dynamic import of `navbar.js` | conditional on `!window._noNavbar` |

### `entry.js` flow

```js
if (hasFeatures(BASELINE)) {
  import('./upgrades');                       // tippy, code-block enhancers, MathJax bridge
  if (!window._noNavbar)  import('./navbar');
  if (hasFeatures(DARK_MODE_FEATURES)) import('./pro/dark-mode');
  if (window._clapButton && hasFeatures(CLAP_BUTTON_FEATURES)) import('./clap-button');
  if (!window._noDrawer  && hasFeatures(DRAWER_FEATURES)) import('./drawer');
  if (!window._noPushState && hasFeatures(PUSH_STATE_FEATURES)) import('./push-state');
}
```

Feature lists (`BASELINE`, `DRAWER_FEATURES`, …) are Modernizr keys; any
missing required feature silently disables that subsystem.

### `drawer.js` — what it actually does

Top-level flow (relevant for our overrides):

1. Awaits webcomponent + stylesheet readiness.
2. Wires `#_menu` click → `drawerEl.toggle()`.
3. Wires every internal `<a href="/...">` inside the sidebar → `drawerEl.close()`
   (so SPA navigation auto-dismisses the drawer).
4. Saves `scrollTop`. Computes initial `opened` =
   `drawerEl.classList.contains('cover') && scrollTop <= 0 && !history.state.closedOnce`.
5. If `!opened`, sets `history.state.closedOnce = true` and removes the
   `opened` attribute.
6. On `hy-drawer-init`, adds `.loaded` class, calls `setupIcon` (creates
   `#_swipe`), and resets scroll if needed.
7. Imports `@hydecorp/drawer` (the actual custom element implementation).
8. Subscribes RxJS pipelines:
   - `peekWidth$` ← `peek-width-change` events from drawer
   - `viewWidth$` ← **`window.resize`** (passive)
   - `distance$` ← combineLatest(peekWidth$, viewWidth$)
   - `t$` ← driven by `distance$` and `hy-drawer-move` events
   - `t$.tap(updateSidebar)` — sets `sidebar.style.transform = translateX(...)`
9. Wires the wheel-to-close behaviour:
   ```js
   fromEvent(document, 'wheel', { passive: false })
     .pipe(subscribeWhen(opened$), filter(e => e.deltaY > 0),
           tap(e => drawerEl.translateX > 0 && e.preventDefault()),
           throttleTime(500),
           tap(() => drawerEl.close()));
   ```
   This is **wheel-event only** (mouse / trackpad on desktop). Touch scroll on
   mobile does NOT fire `wheel` in iOS Safari, so cover stays opened until
   the user explicitly dismisses it via the swipe icon.

Implications:

- `noscroll` is read by `@hydecorp/drawer`'s touch handler and triggers
  `event.preventDefault()` only when the drawer interprets a touch as a
  drag-the-drawer gesture (compares horizontal vs vertical deltas). It does
  not lock body scroll.
- The drawer JS uses `window.resize` directly. **Our** overrides must NOT
  add a second `resize` listener that mutates drawer state, or it
  re-opens after the user dismisses (this is the iOS Safari address-bar
  bug we hit). Use `matchMedia('change')` instead.
- The drawer module adds `.loaded` to the host on `hy-drawer-init`. Hydejack
  CSS ships `hy-drawer.loaded { position: static }` (no media query!) — any
  rule that competes with this needs `!important` or higher specificity.

### Hydejack custom elements

| Tag | Source | Role |
|---|---|---|
| `<hy-drawer>` | `@hydecorp/drawer` | The slide-out side panel. Attributes: `id`, `class="cover"`, `side="left"`, `threshold`, `noscroll`, `opened`, `mouseevents`. Methods: `.open()`, `.close()`, `.toggle()`. Events: `hy-drawer-init`, `hy-drawer-prepare`, `hy-drawer-move`, `hy-drawer-transitioned`. |
| `<hy-push-state>` | `@hydecorp/push-state` | SPA navigation wrapper. Attributes: `id`, `replace-selector`, `link-selector`, `script-selector`, `duration`, `hashchange`. Events: `hy-push-state-start`, `hy-push-state-ready`, `hy-push-state-after`, `hy-push-state-progress`, `hy-push-state-error`, `hy-push-state-load`. |
| `<hy-img>` | upgraded by `upgrades.js` | Lazy + animated image element with `srcset` support. |

Element registration is async — `await @hydecorp/drawer` happens *inside*
`drawer.js`. Anything synchronous on the drawer element (e.g. our pre-upgrade
IIFE) must work via attributes (`hasAttribute`/`removeAttribute`) rather than
custom-element methods until after `hy-drawer-init` fires.

---

## 11. Layout-driving CSS rules

The rules our overrides interact with:

```scss
// hy-drawer host (free flow → fixed at desktop → dynamic at wide)
hy-drawer {
  width: 100%; position: relative; overflow: hidden;
  --hy-drawer-peek-width: .5rem;

  @media (min-width: 64em) {                    // $break-point-3
    position: fixed; width: 21rem; top: 0; left: 0; bottom: 0;
    --hy-drawer-peek-width: 21rem;
    &.cover { position: relative; width: 100% }
  }
  @media (min-width: 104em) {                    // $break-point-dynamic
    width: calc(50% - 31rem);                    // = 50% - $half-content
    --hy-drawer-peek-width: calc(50% - 31rem);
  }
  &.loaded { position: static }                  // applied AFTER drawer JS init
}

// .sidebar (the inner header element)
.sidebar { display: flex; justify-content: center; align-items: center;
           min-height: 100vh; }

.sidebar-sticky { max-width: 21rem; padding: 1.5rem; contain: content; }

// body::before — the gray-bg "spine" that mirrors the sidebar
body::before {
  content: ''; position: fixed; left: 0; top: 0; bottom: 0;
  width: .5rem; background: var(--gray-bg);
  @media (min-width: 64em) { width: 21rem }
  @media (min-width: 104em) { width: calc(50% - 31rem) }
}

// .content — article column
.content {
  margin-left: auto; margin-right: auto;
  padding: 8rem 1rem 12rem;
  @media (min-width: 42em) { max-width: 42rem }
  @media (min-width: 54em) { max-width: 48rem }
  @media (min-width: 64em) {
    padding-left: 1rem;
    margin-left: calc(21rem + 3rem);            // sidebar + content-margin-3
    margin-right: 3rem;
  }
  @media (min-width: 86em) {
    padding-top: 9rem;
    margin-left: calc(21rem + 4rem);            // sidebar + content-margin-5
    margin-right: 4rem;
    max-width: 54rem;
  }
  @media (min-width: 104em) {
    margin: auto;                                // CENTERED on wide viewports
  }
}
```

**The half-transparent `body::before` bug**: at `≥104em` Hydejack lets
`body::before` width grow to `calc(50% - 31rem)`, which on a wide viewport
overshoots the visible drawer and appears as a faint half-transparent rectangle
on top of the article column in dark mode. Pin `body::before { width: … }` to
match the (overridden) sidebar width to prevent this.

**The `.content { margin: auto }` at `≥104em` regression**: when we widen
`.content { max-width }` past 54rem, Hydejack's auto-centering pulls the left
edge into the sidebar gutter. Fix by pinning `.content { margin-left: <sidebar
+ 4rem>; margin-right: auto }` at the same breakpoint.

---

## 12. Front-matter conventions

| Key | Used by | Effect |
|---|---|---|
| `layout` | Jekyll | Picks one of `_layouts/*.html` |
| `title` | base + leaf layouts | `<h1 class="page-title">` and SEO title |
| `description` | base + page + post + about | rendered as `.note-sm` under the title; suppressed by `hide_description: true` |
| `cover` | body/index.html | true = sidebar before main + `class="cover"` + `opened` on drawer |
| `accent_image` | base.html | `image` passed to sidebar-bg |
| `accent_color` | base.html | `color` passed to sidebar-bg |
| `theme_color` | base + meta | `<meta name="theme-color">` and dark-mode-body-bg derivation |
| `image` (hash with `path`/`background`/`overlay`) | sidebar-bg | inline `style="background:…"` |
| `invert_sidebar` | sidebar.html | flips text from white to dark |
| `redirect.to` | meta + body | meta-refresh-only page |
| `noindex` / `no_index` / `sitemap: false` | meta | adds `<meta name="robots" content="noindex">` |
| `keywords` | meta | meta keywords |
| `lang` | base.html | `<html lang="…">` |
| `addons` / `post_addons` / `project_addons` | post layout | which post-tail components to render (about, related, comments, …) |
| `no_link_title` / `no_excerpt` / `hide_image` | components/post.html | trim post rendering |
| `hide_dates` / `hide_last_modified` | components/post.html | trim post metadata |

Layout-specific front-matter (used by leaf layouts above):

| Layout | Extra keys |
|---|---|
| `post` | `categories`, `tags`, `related_posts`, `image`, `addons` |
| `project` (PRO) | `date`, `image`, `caption`, `description`, `links`, `featured` |
| `projects` (PRO) | `show_collection`, `featured` |
| `list` / `grid` | `slug`, `description`, `no_link_title`, `no_excerpt` |
| `resume` (PRO) | `left_column`, `right_column`, `buttons`, `no_skill_icons`, `no_language_icons` |
| `welcome` (PRO) | `cover`, `selected_projects`, `projects_page`, `selected_posts`, `posts_page`, `featured` |
| `redirect` | `redirect.to` (a hash with `to:` URL) |

**Project-specific extensions added in this repo** (NOT upstream):

- `desktop_cover: true|false` — show the cover hero on desktop only
- `mobile_cover: true|false` — show the cover hero on mobile only

These are handled by our `_includes/body/index.html` override + CSS
reverts in `_includes/my-head.html`. See `update_logs.md` for the full
motivation.

---

## 13. Hydejack feature flags (`site.hydejack.*`)

Read in `head/scripts.html` (sets `window._no*`), in `base-classes`
(adds class names), and in various includes / SCSS to gate features.
Exhaustive list with effect:

| Flag | Default | Disables |
|---|---|---|
| `no_push_state` | false | SPA navigation (full page reloads on every click) |
| `no_drawer` | false | drawer JS (sidebar still renders, no swipe/toggle) |
| `no_navbar` | false | the auto-hide JS (navbar still renders statically) |
| `no_search` | false | mini-search (PRO) |
| `no_inline_css` | false | the `_styleInline` block — full sheet linked instead |
| `no_page_style` | false | the per-page `_pageStyle` block (static accent color across whole site) |
| `no_break_layout` | true (project) / false (theme default) | the `.break-layout` rule (full-bleed code blocks, tables) |
| `no_mark_external` | false | the icon next to external links |
| `no_toc` | false | the floating TOC (PRO) |
| `no_third_column` | false | extending content into a "third column" on wide screens |
| `no_large_headings` | false | the oversized headings on wide screens |
| `no_structured_data` | false | JSON-LD blocks |
| `no_theme_color` | false | the `<meta name="theme-color">` tag |
| `no_breadcrumbs` | false | the breadcrumbs in `body/main.html` |
| `use_lsi` | true | lsi-based "related posts" |
| `cookies_banner` | true | the cookie consent banner |
| `advertise` | true | the "Powered by Hydejack" footer line |
| `hide_dates` / `hide_last_modified` | false | post metadata |
| `dark_mode.always` | false | force dark mode |
| `dark_mode.dynamic` | true | follow `prefers-color-scheme` + sunrise/sunset |
| `dark_mode.icon` | true | render the dark-mode toggle icon |
| `dark_mode.sunrise` / `dark_mode.sunset` | 6 / 18 | local-time fallback when `prefers-color-scheme: no-preference` |
| `offline.enabled` | false | service worker |

Flags that affect the BUILD (compiled differently):

- `no_inline_css: true` → external sheet contains everything (`*.pre.scss`)
  and the inline `<style>` is omitted.
- `no_page_style: true` → falls back to a single static accent color block
  emitted once in `common.scss`.
- `no_break_layout: true` → drops the `__link__/break-layout` import.
- `no_mark_external: true` → drops the `__link__/mark-external` import.

---

## 14. User override slots

| File | Loaded by | When to use |
|---|---|---|
| `_includes/my-head.html` | `head/index.html` (last include in `<head>`) | Custom CSS, fonts, analytics. The standard place for site-specific styling. |
| `_includes/my-body.html` | `body/index.html` (after `body/scripts.html`) | Trailing scripts (analytics, footer-info loaders, etc.). |
| `_includes/my-scripts.html` | `body/scripts.html` (between hydejack JS and analytics) | Extra `<script>` tags that should run after Hydejack's main bundle but before analytics. |
| `_includes/my-comments.html` | `body/comments.html` | Replace the comments system. |
| `_sass/my-variables.scss` | `style.scss` + `inline.scss` (right after `variables`) | Override SCSS variables. |
| `_sass/my-inline.scss` | imported INSIDE `inline.scss` after all hydejack inline partials | Critical CSS only. |
| `_sass/my-style.scss` | imported in `style.scss` (after all hydejack link partials) | Non-critical CSS. |
| `_includes/body/*.html` | shadowed by Jekyll's theme cascade if a project file has the same path | Targeted body-composition tweaks. THIS is how `_includes/body/index.html` shadowing works in this repo. |

Anything in `_includes/` or `_sass/` of the consuming Jekyll site shadows the
same path in the theme. We use this for the `body/index.html` override.

---

## 15. `compress_html` (root layout)

`_layouts/compress.html` runs Liquid-only HTML minification with these knobs
(set in the consuming `_config.yml`):

```yaml
compress_html:
  comments:   ["<!-- ", " -->"]   # strip HTML comments delimited by these
  clippings:  all                  # strip whitespace inside listed elements
  endings:    all                  # drop closing tags where allowed (</p>, </li>, …)
  startings:  []                   # drop opening tags where allowed (<head>, <body>, …)
  blanklines: false                # collapse blank lines
  ignore:
    envs: [development]            # skip compression entirely in dev
```

Behaviours that bite us:

1. **Strips newlines inside `<script>` blocks.** Any `// line comment` swallows
   the rest of the script. Use `/* … */` only.
2. **Strips HTML comments.** Liquid comment blocks (`{% comment %}…{%endcomment%}`)
   are still safe — they're Liquid, not HTML.
3. **Joins separate `<style>` and `<script>` blocks together** if no
   non-whitespace HTML separates them. Author CSS still cascades correctly,
   but the order in the source file is preserved.
4. **Skipped in development.** A bug only visible in production therefore
   may be a `compress_html`-stripping artefact. Use the production preview
   command from CLAUDE.md to reproduce.

---

## 16. Production vs development

| Aspect | development | production |
|---|---|---|
| `JEKYLL_ENV` | unset (defaults to `development`) | `production` |
| `compress_html` | skipped (`ignore.envs: [development]`) | runs |
| `<style id="_styleInline">` block | NOT generated | generated |
| External CSS file | contains everything (full sheet) | contains the post-load partials only |
| `.well-known`, `vendor/`, `Gemfile` | usually included | excluded by site `exclude:` list |
| Search index `INDEX_KEY` | regenerated each build | regenerated each build (it's just the build timestamp) |

Reproducing production locally: see `README.md` "Preview in production mode".
Diff between the two builds is significant — most layout regressions only
manifest in production.

---

## 17. PRO vs free

This repo uses the free Hydejack v9.2.1. PRO-only features (per the
upstream README's free-vs-PRO matrix):

- **Dark mode** the icon toggle — wired via `_includes/templates/pro/dark-mode.html`
  and `_sass/pro/dark-mode-dynamic.scss`. Shipped behind `site.hydejack.dark_mode`.
  The free build uses a partial dark-mode-fix shim only.
- **Offline support** — `site.hydejack.offline.{enabled,cache_version,precache_assets}`
  is a config slot the free theme reads but doesn't act on. The free build
  ships zero service-worker registration code and no `/assets/js/sw.js`. To
  get offline behaviour without PRO you have to write your own service
  worker (this repo does — see `assets/js/sw.js` + the registration in
  `_includes/my-body.html`).
- **Newsletter / Disqus / Tinyletter** integrations — gated by config keys
  that are no-ops in the free version.
- **Search** — full-text mini-search, gated behind `site.hydejack.no_search`.
- **Resume / Project / Featured-collection layouts** (`resume`, `project`,
  `projects`, `welcome`, `grid`) — referenced in upstream docs but the
  layout files / PRO-only components aren't present in the free theme.
  Setting `layout: project` on a free build will fall through to default
  or 404 depending on plugin order.
- **Clap button** — shipped under `site.clap_button` flag.

---

## 18. Markdown / writing extensions

Hydejack uses kramdown's `{:.class}` syntax to add styled wrappers around
markdown content. The supported classes:

| Class | Effect |
|---|---|
| `{:.lead}` | Larger, emphasised paragraph (or full-width image when applied to `![](...)`). |
| `{:.note}` | Callout box. Add a `title` via `{:.note title="…"}`. |
| `{:.message}` | Generic message box. |
| `{:.faded}` | Gray, de-emphasised text. |
| `{:.figcaption}` | Caption below an image, table, or code block. |
| `{:.large-only}` | Element only renders on `≥104em` viewports. |
| `{:.smaller}` | Smaller font on tables. |
| `{:.scroll-table}` | Force horizontal scroll on overflowing tables. |
| `{:.stretch-table}` | Full-width tables on small screens. |

The auto-TOC tag is `* TOC{:toc}` (sticky on `≥104em` displays when not
disabled by `site.hydejack.no_toc`).

### Code blocks

Use kramdown / Rouge fenced blocks. **Don't** use Jekyll's
`{% highlight %}` tags — they break the layout because the theme expects
the kramdown structure. Add a filename via a first-line comment:

```js
// file: "code-block.js"
var foo = …;
```

The theme's `upgrades.js` parses that title, lifts it into a header bar,
and adds a copy-to-clipboard button (where supported).

### Math

`_config.yml` `kramdown.math_engine: katex` (or `mathjax`). Inline math
uses `$$ … $$` and block math wraps in `$$ \begin{aligned}…\end{aligned} $$`.
Don't use `align`/`align*` — KaTeX rejects it.

### Images

```
![alt](/path.jpg){:.lead width="800" height="100" loading="lazy"}
```

`{:.lead}` makes it full-width. Always include `width`/`height` to avoid
CLS. `loading="lazy"` is honoured by Hydejack's `<hy-img>` upgrade.

---

## 19. Collection conventions

Jekyll collections that the upstream layouts expect:

| Path | Collection | Used by |
|---|---|---|
| `_posts/<YYYY-MM-DD>-<slug>.md` | built-in `posts` | `post.html` |
| `_projects/<slug>.md` | `projects` (configure in `_config.yml`) | `project.html`, `projects.html` (PRO) |
| `_featured_categories/<name>.md` | `featured_categories` | `list.html` (and `grid.html` PRO) |
| `_featured_tags/<name>.md` | `featured_tags` | `list.html` (and `grid.html` PRO) |
| `_data/resume.yml` or `_data/resume.json` | n/a (Jekyll data) | `resume.html` (PRO); JSON Resume schema |
| `_data/authors.yml` | n/a | sidebar profile + author swap-in (`<!--author-->` marker in about layout) |
| `_data/strings.yml` | n/a | UI strings (i18n) |
| `_data/variables.yml` | n/a | SCSS variable overrides via Liquid |

Layout-specific HTML markers (the layout substitutes content at these
strings):

- `<!--author-->` in `about.html` — inserts author picture + bio.
- `<!--projects-->` in `welcome.html` (PRO) — inserts featured projects.
- `<!--posts-->` in `welcome.html` (PRO) — inserts featured posts.
- `<!--posts_list-->` in `welcome.html` (PRO) — inserts a paginated post list.

PRO files in the upstream repo carry placeholder content (e.g.
`pro/dark-mode-fix.html` is a tiny shim, not the full implementation). Do
NOT assume calling a `pro/*` include will render the full PRO feature.

---

## 20. Common gotchas (when overriding)

1. **`hy-drawer.cover { width: 100% }` lives at desktop-only media query but
   has higher specificity** (`hy-drawer.cover` = (0,1,1)) than plain
   `hy-drawer` (0,0,1). To beat it, use `!important` or match its specificity.

2. **`hy-drawer.loaded { position: static }` applies at all viewports** (no
   media query). Any `position` override on the drawer needs `!important` or
   has to also target `.loaded`.

3. **`.sidebar-sticky { max-width: 21rem }` is unconditional** (no media
   query). Widening only the drawer host without touching `.sidebar-sticky`
   max-width does nothing to the visible content row.

4. **`body::before` width tracks `$break-point-dynamic` (104em)** with
   `calc(50% - $half-content)`, which on wide monitors overshoots the
   visible drawer. Always pin `body::before { width: … }` when overriding
   the sidebar width.

5. **`include_cached` keys on the parameter VALUES.** Different params yield
   different cached outputs; same params reuse. Don't pass mutable state.

6. **`hy-push-state` script-selector="script" makes scripts INSIDE `#_main`
   re-execute on SPA navigation.** Scripts OUTSIDE `#_main` (e.g. in our
   `_includes/body/index.html` override after `</hy-push-state>`) run once
   per full page-load only.

7. **`_includes/scripts/*.min.js` and `_includes/styles/*.scss` are Liquid-
   processed.** Liquid syntax inside JS/SCSS strings is interpreted at
   build time. If you need a literal `{{` or `{%`, escape it with
   `{% raw %}…{% endraw %}`.

8. **The `_pageStyle` block emits per-page `--accent-color`, `--theme-color`,
   `--dark-mode-body-bg`** — if you set these as constants in `my-head.html`
   they will be **overridden** for any page that has its own `accent_color`
   front-matter unless `site.hydejack.no_page_style: true`.

9. **Hydejack's `.cover` flag drives DOM ordering** (sidebar before vs after
   main). Switching cover state without a full page reload would require
   physically moving the sidebar element in the DOM. Our per-viewport
   approach instead always puts the sidebar before main and uses CSS to
   make the off-viewport variant look like the non-cover layout.

10. **Versioned filenames** (`hydejack-9.2.1.js`, `hydejack-9.2.1.css`) mean
    upgrading the theme = new asset paths. Anything in our overrides that
    references those filenames by string (we don't currently) would need
    updating in lockstep.

11. **HTML comments do NOT shield Liquid tags.** Liquid processes
    `{% include … %}`, `{% if … %}`, etc. INSIDE `<!-- … -->` blocks
    too — comments are an HTML-level concept stripped after Liquid has
    finished evaluating. Documenting an include with a literal example
    inside an HTML comment in that same include file produces infinite
    recursion (Liquid stack overflow at build time). Use Liquid's
    `{% comment %} … {% endcomment %}` for any in-source docs that
    contain Liquid-tag examples.

---

## When to consult this file

Before:

- Touching `_includes/body/index.html` or anything below it
- Touching `_includes/my-head.html` CSS that targets `hy-drawer*`,
  `.sidebar*`, `.content`, or `body::before`
- Adding a new inline `<script>` in any include
- Bumping `vars.sidebar_width` / break points in `_config.yml`
- Trying to "fix" something that only breaks in production
- Trying to override behaviour that lives in `drawer.js`, `push-state.js`,
  or `navbar.js` (you can only react to events from these — you can't
  intercept their RxJS pipelines)

When upstream Hydejack updates: re-read sections 3, 4, 7, and 11 to confirm
the file paths and selectors haven't shifted.
