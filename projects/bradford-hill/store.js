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

  // Split the numbered lines into sentences, keeping each sentence's line range and section.
  SECTION_RE: /^\s*(?:\d+(?:\.\d+)*\.?\s+)?(abstract|summary|introduction|background|(?:materials|patients|subjects|participants) and methods|methods?|methodology|study (?:design|population)|results|discussion|conclusions?|(?:strengths and )?limitations|references|bibliography|literature cited|acknowledge?ments?|tables?|figure legends|appendix|supplementary (?:material|materials|data))\s*:?\s*$/i,
  sectionName(h) {
    h = h.toLowerCase();
    if (/abstract|summary/.test(h)) return "Abstract";
    if (/introduction|background/.test(h)) return "Introduction";
    if (/method|design|population/.test(h)) return "Methods";
    if (/results/.test(h)) return "Results";
    if (/discussion|limitations/.test(h)) return "Discussion";
    if (/conclusion/.test(h)) return "Conclusion";
    if (/references|bibliography|literature/.test(h)) return "References";
    if (/acknowledg/.test(h)) return "Back matter";
    return "Tables & appendix";
  },
  sentences(lines) {
    const clean = lines.map(l => l.replace(/\f/g, "")), secOf = [], brk = new Set(), out = [];
    let sec = "Front matter", body = sec, tableLeft = 0;
    clean.forEach((l, i) => {
      const m = l.trim().length < 60 && l.match(this.SECTION_RE);
      if (m) { sec = body = this.sectionName(m[1]); tableLeft = 0; brk.add(i); }
      else if (/^\s*(?:Table|TABLE)\s+S?\d+\b/.test(l) && body !== "References") { sec = "Tables & appendix"; tableLeft = 40; brk.add(i); }
      else if (tableLeft && (!l.trim() || --tableLeft === 0)) { sec = body; tableLeft = 0; }
      if (!l.trim()) brk.add(i);
      secOf[i] = sec;
    });
    const ABBR = /(?:\bet al|\be\.g|\bi\.e|\bvs|\bFigs?|\bNo|\bapprox|\bDr|\bcf|\bca|\bRef|\bEq|\bTab|\bSuppl|\b[A-Z])\.$/;
    const flush = block => {
      if (!block.length) return;
      let s = ""; const offs = [];
      block.forEach((i, k) => {
        const t = clean[i].trim(); offs.push(s.length);
        const nxt = k < block.length - 1 ? clean[block[k + 1]].trim() : "";
        if (/[A-Za-z]-$/.test(t) && /^[a-z]/.test(nxt)) s += t.slice(0, -1); else s += t + " ";
      });
      const lineAt = pos => { let k = 0; while (k + 1 < offs.length && offs[k + 1] <= pos) k++; return k; };
      const push = (a, b) => {
        const text = s.slice(a, b).trim(); if (text.length < 3) return;
        const l1 = lineAt(a), l2 = lineAt(Math.max(a, b - 1));
        if (b - a > 900 && l2 > l1) {
          for (let k = l1; k <= l2; k += 4) push2(Math.max(a, offs[k]), Math.min(b, k + 4 < offs.length ? offs[k + 4] : s.length), k, Math.min(l2, k + 3));
          return;
        }
        push2(a, b, l1, l2);
      };
      const push2 = (a, b, l1, l2) => {
        const text = s.slice(a, b).trim(); if (text.length < 3) return;
        out.push({ text, a: block[l1] + 1, b: block[l2] + 1, section: secOf[block[l1]] });
      };
      const re = /[.!?]["'\u201d\u2019)\]]*\s+(?=[A-Z(\["\u201c])/g; let m, start = 0;
      while ((m = re.exec(s))) {
        if (ABBR.test(s.slice(Math.max(start, m.index - 10), m.index + 1))) continue;
        push(start, m.index + m[0].length); start = re.lastIndex;
      }
      push(start, s.length);
    };
    let block = [];
    clean.forEach((l, i) => {
      if (brk.has(i)) { flush(block); block = []; if (!l.trim() || secOf[i] === "References") return; if (l.match(this.SECTION_RE)) return; }
      if (secOf[i] === "References") return;
      block.push(i);
    });
    flush(block);
    return out;
  },
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
