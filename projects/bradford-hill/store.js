// Shared storage: documents saved by step 1 are available to steps 2 and 3.
const BH = {
  KEY: "bradfordHill.docs",
  all() { try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch { return {}; } },
  save(name, text, meta = {}) {
    const d = this.all(); d[name] = { text, ...meta, saved: new Date().toISOString() };
    try { localStorage.setItem(this.KEY, JSON.stringify(d)); return true; }
    catch { alert("Browser storage is full. Download the .txt instead and load it from the file in the next step."); return false; }
  },
  remove(name) { const d = this.all(); delete d[name]; localStorage.setItem(this.KEY, JSON.stringify(d)); },
  // Line i (1-based) is the i-th "\n"-separated line, as in pdftotext output; "\f" starts a new page.
  lines(text) { return text.split("\n"); },
  pages(lines) { let p = 1; return lines.map(l => (p += (l.match(/\f/g) || []).length)); },
  cite(name, a, b) { return `[${name}:${a}${b && b !== a ? "-" + b : ""}]`; },
  esc(s) { return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); },
  download(name, content, type = "text/plain") {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  readFile(file) { return new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsText(file); }); },
  nav(step) {
    const s = [["1-pdf-to-text.html", "1. PDF to Text"], ["2-coordinate-system.html", "2. Coordinate System"], ["3-bradford-hill-factors.html", "3. Bradford Hill Factors"]];
    document.querySelector("nav").innerHTML = s.map(([f, t], i) => `<a href="${f}" class="${i + 1 === step ? "on" : ""}">${t}</a>`).join("") +
      `<a href="../../project.html?p=bradford-hill" style="margin-left:auto">← Project</a>`;
  },
};
