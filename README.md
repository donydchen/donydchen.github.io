# Donny Y. Chen's Homepage


Kindly check: [https://donydchen.github.io/](https://donydchen.github.io/)

Powered by [Hydejack](https://hydejack.com/) v9.2.1; Modified from [HERE](https://bo-zhang.me/); Hosted at [GitHub Pages](https://docs.github.com/en/pages).

## Installation

To run locally, 

```bash
git clone https://github.com/donydchen/donydchen.github.io.git
cd donydchen.github.io
bundle install
bundle exec jekyll serve
```

Then, head to [http://127.0.0.1:4000/](http://127.0.0.1:4000/) to preview your local edits.

### Preview in production mode

`bundle exec jekyll serve` runs in development mode, which behaves differently from GitHub Pages: critical-CSS inlining (`<style id="_styleInline">`) and HTML minification (`compress_html`) are **off**. To reproduce the deployed site exactly — useful when a change works locally but breaks after pushing — run:

```bash
JEKYLL_ENV=production PAGES_REPO_NWO=donydchen/donydchen.github.io bundle exec jekyll serve
```

Notes:
* HTML minification strips newlines inside `<script>` blocks. Always use `/* … */` block comments inside inline scripts; `//` line comments collapse into one giant comment that swallows the rest of the script.
* `PAGES_REPO_NWO` satisfies `jekyll-github-metadata` so the build doesn't fail on the canonical-URL lookup.

## Troubleshooting

* If you are running this project on a Mac and encounter errors like `nokogiri (>= 1.16.5) was resolved to 1.17.2, which depends on ruby (>= 3.0.0)`, refer to [this guide](https://dev.to/luizgadao/easy-way-to-change-ruby-version-in-mac-m1-m2-and-m3-16hl) to upgrade your Ruby version before proceeding.
