const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

function card(p, { href = p.file, tags = "", extra = "" } = {}) {
  const a = document.createElement("a");
  a.className = "card";
  a.href = href;
  const ext = (p.file || "").split(".").pop().toLowerCase();
  if (["pptx", "ppt", "key"].includes(ext)) a.setAttribute("download", "");
  else if (ext === "pdf") a.target = "_blank";
  const label = ext === "pdf" ? "PDF &middot; opens in browser" : `.${esc(ext)} &middot; download`;
  const thumb = p.thumbnail
    ? `<div class="thumb"><img src="${esc(p.thumbnail)}" alt="" loading="lazy"></div>`
    : ext === "html"
      ? `<div class="thumb"><iframe src="${esc(p.file)}" loading="lazy" tabindex="-1" title="${esc(p.title)}"></iframe></div>`
      : `<div class="thumb file">Slides<span>${label}</span></div>`;
  a.innerHTML = `
    ${thumb}
    <div class="meta"><h3>${esc(p.title)}</h3><p>${esc(p.description || "")}</p>${tags ? `<div class="tags">${tags}</div>` : ""}${extra}</div>`;
  return a;
}

function renderSimple(id, items, opts = () => ({})) {
  const el = document.getElementById(id);
  if (!el) return;
  if (!items.length) el.innerHTML = '<p class="empty">Coming soon.</p>';
  for (const p of items) el.appendChild(card(p, opts(p)));
}

function renderFiltered(prefix, items) {
  const groups = [
    { key: "languages", label: "Language" },
    { key: "topics", label: "Topic" },
  ];
  const selected = { languages: new Set(), topics: new Set() };
  const grid = document.getElementById(`${prefix}-grid`);
  const filtersEl = document.getElementById(`${prefix}-filters`);
  const countEl = document.getElementById(`${prefix}-count`);
  if (!grid) return;

  for (const g of groups) {
    const values = [...new Set(items.flatMap(p => p[g.key] || []))].sort();
    if (!values.length) continue;
    const row = document.createElement("div");
    row.className = "filter-row";
    row.innerHTML = `<span class="label">${g.label}</span>`;
    const all = document.createElement("button");
    all.className = "chip active";
    all.textContent = "All";
    row.appendChild(all);
    const chips = values.map(v => {
      const b = document.createElement("button");
      b.className = "chip";
      b.textContent = v;
      b.onclick = () => {
        selected[g.key].has(v) ? selected[g.key].delete(v) : selected[g.key].add(v);
        b.classList.toggle("active");
        all.classList.toggle("active", selected[g.key].size === 0);
        render();
      };
      row.appendChild(b);
      return b;
    });
    all.onclick = () => {
      selected[g.key].clear();
      chips.forEach(c => c.classList.remove("active"));
      all.classList.add("active");
      render();
    };
    filtersEl.appendChild(row);
  }

  const matches = p => groups.every(g => {
    const sel = selected[g.key];
    return sel.size === 0 || (p[g.key] || []).some(v => sel.has(v));
  });

  function render() {
    grid.innerHTML = "";
    if (!items.length) {
      grid.innerHTML = '<p class="empty">Coming soon.</p>';
      return;
    }
    const shown = items.filter(matches);
    countEl.textContent = `Showing ${shown.length} of ${items.length}`;
    if (!shown.length) grid.innerHTML = '<p class="empty">No projects match these filters.</p>';
    for (const p of shown) {
      const tags = [
        ...(p.languages || []).map(t => `<span class="tag lang">${esc(t)}</span>`),
        ...(p.topics || []).map(t => `<span class="tag">${esc(t)}</span>`),
      ].join("");
      grid.appendChild(card(p, { tags }));
    }
  }
  render();
}

function renderPresentations() {
  renderSimple("presentations-grid", presentations, p => ({
    href: `slideshow.html?deck=${encodeURIComponent(p.id)}`,
    extra: '<div class="pages">Slideshow</div>',
  }));
}

function renderProjects() {
  const items = projects.map(p => ({ ...p, file: p.file || (p.pages[0] || {}).file || "" }));
  renderSimple("projects-grid", items, p => ({
    href: `project.html?p=${encodeURIComponent(p.id)}`,
    extra: `<div class="pages">${p.pages.length} page${p.pages.length === 1 ? "" : "s"}</div>`,
  }));
}

function renderProjectPage() {
  const id = new URLSearchParams(location.search).get("p");
  const p = projects.find(x => x.id === id);
  if (!p) {
    document.getElementById("title").textContent = "Project not found";
    return;
  }
  document.title = `${p.title} — Anya`;
  document.getElementById("title").textContent = p.title;
  document.getElementById("desc").textContent = p.description || "";
  if (p.tryIt) {
    const links = (p.tryIt.downloads || [])
      .map(d => `<a class="chip" href="${esc(d.file)}" download>${esc(d.label)}</a>`).join("");
    document.getElementById("try").innerHTML = `
      <h2>Try it</h2>
      <p class="try-text">${esc(p.tryIt.text || "")}</p>
      <div class="filter-row">${links}</div>`;
  }
  renderSimple("pages-grid", p.pages);
}

document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
});
