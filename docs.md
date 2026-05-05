---
layout: page
title: Documentation
description: >
  How to fork this homepage and make it yours. Adding papers,
  co-authors, projects, talks, and news.
permalink: /docs/
sitemap: false
---

You're welcome to fork this repo and use it as the basis for your own academic homepage. Start with the [project README](https://github.com/donydchen/donydchen.github.io#setup) for the local-preview setup. Once you can see the homepage at <http://127.0.0.1:4000/>, the rest of the walkthrough is below.

## Make it yours
{:.h1 .index-header}

A handful of files cover most of what you will edit.

| File | What is in it |
|---|---|
| `_config.yml` | Site title, accent color, GitHub repo for the auto-updated footer. |
| `_data/authors.yml` | Sidebar profile picture, tagline, social-icon list. |
| `index.md` | Homepage prose. Your short bio, talks list, miscellanies. |
| `_data/publications.yml` | Your publication list. |
| `_data/coauthors.yml` | Co-author names and homepage URLs. |
| `_data/projects.yml` | Talks list and project thumbnail grid. |
| `_data/news.yml` | Short-lived announcements above the bio. |

Drop your photos into `assets/img/`. To change the favicon, replace the files in `assets/icons/` (keep the original filenames so the theme picks them up). <https://realfavicongenerator.net/> can produce the whole set from one source image.

## Configuration
{:.h1 .index-header}

Most keys in `_config.yml` come straight from the Hydejack theme, and the full list is in the [theme config docs](https://hydejack.com/docs/config/). The handful you'll most likely want to change first:

- `title`. Your name. Shown in the browser tab and the footer copyright.
- `tagline`. Short role line, joined to `title` with " | " on the homepage.
- `description`, `keywords`. SEO meta tags.
- `logo`. Site logo, defaults to your sidebar profile photo.
- `author.name`, `author.email`. Used by the about block, footer, and `jekyll-feed`.
- `accent_image`, `accent_color`. The cover-mode background and the accent color used for hover states.
- `menu`. The list of links shown in the sidebar drawer. Each entry is `{title, url}`.

There's also one constant that lives outside `_config.yml`. In `_includes/my-body.html` the `REPO` constant points at this repo so the footer can fetch the "last updated" timestamp from GitHub. Change it to `<your-username>/<your-username>.github.io` after you fork.

Two extras are specific to this fork, both set in the front matter of a page (the homepage uses them in `index.md`):

- `desktop_cover`. Set to `true` to show the cover hero on desktop and iPad landscape views, `false` to skip it.
- `mobile_cover`. Same idea, but for mobile and iPad portrait.

These split the upstream `cover` flag into two viewport-aware switches, so you can keep a clean text-first layout on wide screens while still showing a cover photo on phones. Leave both unset and the page falls back to Hydejack's single-mode `cover:` behavior.

## Adding a paper
{:.h1 .index-header}

Prepend an entry to `_data/publications.yml`. Newest at the top.

```yaml
- title: 'Your Paper Title'
  venue: 'ECCV 2024'
  authors: 'Author One, Author Two, Your Name, Author Four'
  links:
    - {text: 'arXiv',        url: 'https://arxiv.org/abs/...'}
    - {text: 'code',         url: 'https://github.com/.../...'}
    - {text: 'project page', url: 'https://...'}
```

Use plain comma-separated authors. The word "and" before the last name, and the bold around your own name, are added automatically. Your name is read from `_data/authors.yml`, so update the `name:` field there first.

Optional per-link knobs:

- `highlight: true` turns the link into a colored badge (good for "Paper of the Day", "Hacker News" callouts).
- `stars: 'owner/repo'` adds a live GitHub star count next to the link.

There's also an optional `extra:` field on each entry that prints raw HTML below the link row. Use it for "also presented at" notes.

To hide a paper temporarily, comment its lines out with `#`. The text stays in the file in case you want to restore it later.

## Adding a co-author
{:.h1 .index-header}

Add a line to `_data/coauthors.yml`:

```yaml
'First Last': 'https://their-homepage.example/'
```

Names not listed there still get a link. The fallback opens a Google search for the name, which is usually good enough.

## Adding a project or talk
{:.h1 .index-header}

Edit `_data/projects.yml`. Two lists live there.

- `talks` is the text-only invited-talk list. Each entry has a date, talk title, venue, host name, and host URL.
- `cards` is the image-and-caption thumbnail grid. Each entry has an `href`, an `image` (under `assets/img/`), and a `desc` line.

Inline HTML inside `desc` is fine. The YouTube play badge is `<span class="icon-youtube"></span>`.

## Adding news
{:.h1 .index-header}

Edit `_data/news.yml`. Each entry takes:

- `html`. The message body (raw HTML allowed).
- `expires` (optional). A `YYYY-MM-DD` date. After that date the entry hides automatically.

Comment out an entry with `#` to hide it without deleting.

## Publish
{:.h1 .index-header}

Push to GitHub. The site appears at `https://<your-username>.github.io/` in about a minute. GitHub Pages handles the build for you. No extra setup required.

## Going deeper
{:.h1 .index-header}

For the underlying architecture (Jekyll layout overrides, the production-mode preview workflow, the service worker, the cover-mode IIFE), see `CLAUDE.md` at the repo root. That file is for people who want to modify the theme behavior, not just the content.

## License
{:.h1 .index-header}

Free to fork and remix. The full terms are on the [LICENSE page](/LICENSE/).

## Credits
{:.h1 .index-header}

Powered by [Hydejack](https://hydejack.com/) by Florian Klampfer. Modified from [Bo Zhang's homepage](https://bo-zhang.me/). Hosted on [GitHub Pages](https://docs.github.com/en/pages).
