# cthesis.github.io

Christopher's data analyst portfolio. Live at [cthesis.github.io](https://cthesis.github.io/).

## Stack

Plain HTML, CSS, and vanilla JavaScript. No build step, no framework, no dependencies. GitHub Pages serves the repository directly from `main`, so pushing to `main` is the entire deploy process.

## Structure

```
index.html                              home page
projects/
  online-retail-sales-analysis/
    index.html                          full case study
  _template/
    index.html                          starter for the next case study (see comment at top of the file)
assets/
  css/style.css                         shared design system (tokens, components, layout)
  js/main.js                            shared behavior (nav, scroll reveal, count-up metrics, interactive charts)
  img/
    online-retail/                      chart images for that case study
robots.txt
sitemap.xml
```

## Adding a new project

1. Copy `projects/_template/` to `projects/<slug>/` and fill in the content. The template's HTML comment explains what goes where.
2. Add chart/image files to `assets/img/<slug>/`.
3. Add one `.project-card` block to the "Featured Work" section of `index.html`, linking to `projects/<slug>/`.
4. Add a `<url>` entry to `sitemap.xml`.
5. Keep large raw data files (datasets, notebooks) in the project's own GitHub repo, not in this one. Link out to them from the case study's Downloads section instead of committing binaries here, to keep this repo fast to load.

## Design system

Reuse the CSS custom properties and component classes already defined in `assets/css/style.css` (`.metric-card`, `.insight-card`, `.recommendation-card`, `.download-card`, `.process-timeline`, `.chart-figure`, `.list-plain`, etc.) rather than writing new one-off styles per page. Both light and dark mode are handled through the same CSS variables; don't hardcode colors.

## Deployment

GitHub Pages is configured to build from the `main` branch, root folder. There's nothing to run, no Action, no secrets. Push to `main` and the site updates within a minute or two. Check build status with:

```
gh api repos/Cthesis/cthesis.github.io/pages
```
