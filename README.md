# Donny Y. Chen's Homepage

A simple academic homepage. You can see it live at <https://donydchen.github.io/>.

It is built on the [Hydejack] Jekyll theme (free version). I added a few small overrides for the cover hero, sidebar, dark mode, and offline support.

[Hydejack]: https://hydejack.com/

## Setup

Fork this repo and rename your fork to `<your-username>.github.io`. Then on your machine:

```bash
git clone https://github.com/<your-username>/<your-username>.github.io.git
cd <your-username>.github.io
bundle install
bundle exec jekyll serve
```

Open <http://127.0.0.1:4000/> to preview locally.

## Documentation

The rest of the walkthrough lives in [`/docs/`](https://donydchen.github.io/docs/). It covers the data files you'll edit, the config keys you'll most likely change, and how to add papers, co-authors, projects, talks, and news.

## License

The license terms live in [`/LICENSE/`](https://donydchen.github.io/LICENSE/).

## Credits

The theme is [Hydejack v9.2.1][Hydejack] by Florian Klampfer (GPL-3.0).
The layout was adapted from [Bo Zhang's homepage](https://bo-zhang.me/).
The site is hosted on [GitHub Pages](https://pages.github.com/).

## Troubleshooting

If `bundle install` fails on macOS with something like `nokogiri (>= 1.16.5) was resolved to 1.17.2, which depends on ruby (>= 3.0.0)`, your system Ruby is too old. [This guide][ruby-mac] walks through upgrading via `rbenv` on Apple Silicon.

[ruby-mac]: https://dev.to/luizgadao/easy-way-to-change-ruby-version-in-mac-m1-m2-and-m3-16hl

---

Working on the code itself (overrides, service worker, custom CSS)? See `CLAUDE.md` at the repo root. It documents the architecture, the production-mode preview workflow, and the "before you change anything" checklist.
