# CLAUDE.md

This file gives Claude Code (claude.ai/code) the context it needs to work on
this repo without re-deriving everything from scratch.

## What this is

A personal academic homepage hosted at <https://donydchen.github.io>.
Jekyll site built on **Hydejack v9.2.1**
(`remote_theme: hydecorp/hydejack@v9.2.1` in `_config.yml`) with a handful
of project-level overrides in `_includes/`. Content lives in `index.md`.
There is no JS framework, no bundler, no build pipeline beyond
`bundle exec jekyll build`.

## Development

```bash
# Local preview (development mode — fast iteration)
bundle exec jekyll serve

# Local preview in PRODUCTION mode — exactly the toolchain GitHub Pages
# runs (jekyll 3.10 + github-pages 232 + critical-CSS inlining via
# <style id="_styleInline"> + compress_html whitespace stripping).
# Catches bugs that only manifest after deploy. See README for why this
# matters.
JEKYLL_ENV=production PAGES_REPO_NWO=donydchen/donydchen.github.io \
  bundle exec jekyll serve
```

`bundle exec jekyll build` writes to `_site/`. The `hydejack/` directory at
the repo root is a gitignored reference clone of the upstream theme — Jekyll
does not read it, it's just for browsing the original templates.

## Architecture

- **Theme cascade**: Project files in `_includes/`, `_layouts/`, `_sass/`,
  and `assets/` shadow the same paths in the `hydecorp/hydejack` remote
  theme. We only override what we need; everything else comes from
  upstream at build time.
- **Per-viewport cover control**: `_includes/body/index.html` overrides
  Hydejack's `body/index.html` to add `desktop_cover` / `mobile_cover`
  front-matter flags. The matching CSS lives in `_includes/my-head.html`.
  Drawer state (the `opened` attribute) and inline-style locks are
  managed by a small IIFE inside `body/index.html`.
- **Sidebar widening**: `.sidebar-sticky` max-width is bumped from
  Hydejack's default 21rem to 24rem (every viewport, including mobile
  cover hero) and 31.5rem (≥104em) so the social-icons row stays single-
  line as icons are added.
- **Visitor tracking**: the clustrmaps script in `index.md` is deferred
  via `requestIdleCallback` after `window.load` so it never blocks
  rendering even if the CDN hangs or is blocked by an ad-blocker.

## Key files

| File | Why it matters |
|---|---|
| `index.md` | Homepage content + the deferred clustrmaps loader |
| `_config.yml` | Jekyll + Hydejack config (`remote_theme` pinned to v9.2.1) |
| `_data/authors.yml` | Sidebar profile + social-icon list |
| `_includes/my-head.html` | Custom CSS (light/dark vars, sidebar widening, cover-mode reverts) |
| `_includes/body/index.html` | Override of Hydejack's body wrapper — adds the cover-control IIFE |
| `_includes/my-body.html` | Trailing scripts (CF email decoder, footer-info updater, about-section marker, SW registration) |
| `assets/js/sw.js` | Homemade service worker (NOT Hydejack PRO). Published at `/sw.js` via `permalink:`. Registered from `_includes/my-body.html` when `site.hydejack.offline.enabled` is true |
| `assets/docs/update_logs.md` | Historical context for fixes — **read this before changing the cover/sidebar/track-loader code** |
| `assets/docs/hydejack_structure.md` | Field guide to the upstream Hydejack v9.2.1 theme — **read this before any non-trivial CSS/HTML/JS change** so the override doesn't fight the theme's own selectors, RxJS pipelines, or critical-CSS pipeline |

## Working on this repo

Run these in order. Skipping is how regressions get shipped.

1. **Before** modifying or adding any feature:
   - Read `assets/docs/update_logs.md` for the history of related fixes — many of the
     layout decisions look arbitrary without context (the cover-mode IIFE
     in particular went through several iterations to handle compress_html,
     iOS Safari address-bar resize, and the half-transparent body::before
     bug).
   - Read the relevant section of `assets/docs/hydejack_structure.md` so the override
     doesn't blindly fight the theme. The "When to consult this file"
     checklist at the bottom of that doc lists the trigger cases.
2. **While working**: anything that touches `_includes/body/index.html`,
   `_includes/my-head.html`, the drawer, the sidebar, or critical CSS
   should be tested in production-mode preview (see Development above) —
   bugs from `compress_html` and the inlined critical-CSS block only
   manifest there.
3. **At the end of the job, before reporting done**, confirm the change:
   - works on **desktop** AND **mobile** (cover hero on mobile, side panel
     on desktop, plus a mid-screen breakpoint cross if relevant);
   - works in **both light AND dark mode** — every visual change MUST be
     verified in both colour schemes. Any hard-coded colour (e.g.
     `#FFD54F`, `rgba(0,0,0,0.5)`) only works in one mode by accident;
     prefer `color-mix(in srgb, var(--body-color) X%, transparent)` or a
     `--variable` that flips with `body.dark-mode` / `prefers-color-scheme: dark`;
   - does NOT regress prior behaviour on either viewport (run the
     headless tests under `/tmp/cover-test/` if they're still around, or
     re-run them against a fresh production build);
   - works on **every page**, not just the homepage — at minimum smoke-test
     `/`, `/404.html`, and `/LICENSE/` because they use different layouts
     (`plain`, `not-found`, `page`) and different cover settings.
   If any of the four checks can't be verified, say so explicitly rather
   than claiming success.
4. **Append a short entry to `assets/docs/update_logs.md`** covering *why* the change
   was needed and any non-obvious implementation choice. The commit itself
   is intentionally terse; the reasoning lives in the log.
   - **What does NOT need a log entry.** Content updates that the data
     files were designed to absorb — adding a publication to
     `_data/publications.yml`, a co-author to `_data/coauthors.yml`,
     a talk or card to `_data/projects.yml`, a news entry to
     `_data/news.yml`, a sentence to the bio, etc. The log is for the
     homepage / website mechanism itself (layouts, includes, CSS, JS,
     data-file schema additions, theme overrides), not for content
     churn. If you're not sure, ask whether the change touches HOW
     the site works versus WHAT it says — only the former gets logged.
5. **Never commit (or push) without an explicit instruction.** Stage the
   diff, update `assets/docs/update_logs.md`, and wait. The owner commits on their
   own cadence — proactive commits are not welcome.
6. **Commit messages stay short and human** — one line, lowercase, present
   tense. Skip the body. The detail belongs in `assets/docs/update_logs.md`, not in
   `git log`.

## README.md style

`README.md` is for human readers, not LLM readers. Write it like you would
explain the project to a friend over a coffee.

Avoid the punctuation tells of AI-generated prose:

- em-dashes and en-dashes (`—`, `–`) used as a rhetorical hinge between
  two clauses
- semicolons (`;`) joining sentences
- rhetorical colons (`X: Y` as a sentence-builder, not as a label or YAML)

Prefer short sentences separated by periods. If a thought needs more, start
a new sentence. Hyphens inside compound words (`dark-mode`, `auto-updated`)
are fine, of course; the rule is about *punctuation as a stylistic device*,
not about hyphens generally. Code, URLs, and YAML examples keep their
colons because that's syntax, not prose.

This rule applies specifically to `README.md`. The other docs in
`assets/docs/` (`update_logs.md`, `hydejack_structure.md`) are for
internal reference and can use whatever punctuation reads cleanest.

## Commit messages

Write like a humble engineer leaving a note for the next person.
Lowercase subject, present tense, ~50 chars when possible. Skip the body
unless the subject genuinely can't carry the meaning alone.

Good:

```
fix: stop reopening mobile cover on iOS resize
add orcid to sidebar
defer clustrmaps so it never blocks rendering
tweak dark-mode highlight color
```

Avoid:

- Multi-paragraph bodies that re-explain code already visible in the diff
- Robot-speak or over-formal tone ("This commit refactors…")
- Listicles, checklists, marketing buzzwords ("comprehensive", "robust",
  "best-of-both")
- Repeating what the diff already shows
