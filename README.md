# anya-decarlo.github.io

Portfolio site, live at https://anya-decarlo.github.io

All content is listed in `data.js`. To add something, drop the file(s) in the matching folder, add an entry to the matching list, then commit and push — GitHub Pages redeploys automatically.

| Section | Folder | List in `data.js` | Notes |
|---|---|---|---|
| Work | `work/` | `work` | Tag with `languages` (R, SQL, Python) and `topics` (Dementia Research, Sports Data, …); filter buttons are generated from tags. |
| Analysis Tools | `analysis-tools/` | `analysisTools` | Interactive tools; same `languages`/`topics` tags and filters as Work. |
| Projects | `projects/<id>/` | `projects` | Multi-page projects; each card opens `project.html?p=<id>` listing its `pages`. |
| Creative | `creative/` | `creative` | Fun HTMLs, no tags. |
| Education | `education/` | `education` | HTMLs and slides. PDFs open in the browser; .pptx/.key download. Optional `thumbnail` image. |
| Presentations | `presentations/<id>/` | `presentations` | Slide decks exported to PDF (`slides.pdf`) plus a `cover.png` of slide 1; each card opens `slideshow.html?deck=<id>`. |
