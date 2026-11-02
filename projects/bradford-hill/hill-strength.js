// Factor 2: Strength of association. Extracts every ratio estimate (HR, RR, OR, IRR, SMR...) with its CI,
// ranks them against an optional exposure/outcome focus, and grades magnitude, precision and robustness (E-value).
const STRENGTH = {
  name: "Strength of association",
  N: "(\\d+(?:[.·]\\d+)?|[.·]\\d+)",
  get EST_RE() {
    const N = this.N, SEP = "\\s*(?:[-–—−‒]|to|,)\\s*";
    const LAB = "(?:(\\d{2}(?:[.·]\\d)?)\\s*%\\s*(?:CI|C\\.I\\.|CrI|UI|confidence intervals?|credible intervals?|uncertainty intervals?)s?\\s*(?:[:,=]|was|of)?\\s*)";
    const LAB2 = LAB.replace("(\\d{2}", "(?<lev2>\\d{2}");
    return new RegExp(`(?<![\\d.·\\-−–])${N}\\s*(?:([(\\[])\\s*${LAB}?|[,;]?\\s*\\(?\\s*${LAB2})${N}${SEP}${N}\\s*[)\\]]?`, "g");
  },
  MEAS_WORD: /\b(hazard ratio|sub-?distribution hazard ratio|subhazard ratio|relative risk|risk ratio|odds ratio|incidence rate ratio|rate ratio|standardi[sz]ed mortality ratio|standardi[sz]ed incidence ratio|prevalence ratio|relative hazard)s?\b/gi,
  MEAS_ABBR: /\b(a?HRs?|s?HRs?|a?RRs?|a?ORs?|IRRs?|SMRs?|SIRs?|PRs?)\b/g,
  norm(m) {
    const s = m.toLowerCase().replace(/s$/, "");
    if (/hazard/.test(s) || /hr$/.test(s)) return "HR";
    if (/odds/.test(s) || /or$/.test(s)) return "OR";
    if (/incidence rate|irr/.test(s)) return "IRR";
    if (/mortality|smr/.test(s)) return "SMR";
    if (/standardi[sz]ed incidence|sir/.test(s)) return "SIR";
    if (/prevalence|^pr$/.test(s)) return "PR";
    if (/rate ratio/.test(s)) return "Rate ratio";
    return "RR";
  },
  ADJ: /\b(?:adjust(?:ed|ing|ment)|multivariable|multivariate|fully[- ]adjusted|controlling for|model [2-9]|propensity)/i,
  CRUDE: /\b(?:crude|unadjusted|univariate|univariable|age-adjusted only|minimally adjusted)\b/i,
  SUBGROUP: /\b(?:among (?:men|women|males|females|those|participants (?:aged|with)|never|ever|current|former)|subgroup|stratified|sensitivity analys[ie]s|in (?:men|women)\b)/i,
  NOT_EST: /\b(?:median|IQR|interquartile|range|mean|SD|standard deviation|aged?|years? old|BMI|score)\s*(?:\(|=|:|was|of)?\s*$/i,
  OTHER_STUDIES: /\b(?:previous|prior|earlier|other) (?:studies|research|reports|meta-analys[ie]s|trials|cohorts)\b|\bet al\b|\[\d+(?:[,\u2013-]\s*\d+)*\]/i,
  P_RE: /^[^.\n]{0,30}?\b[Pp]\s*(?:[- ]?value)?\s*([<=>≤≥]\s*(?:0?[.·]\d+(?:\s*[x×]\s*10\s*[-−–]?\s*\d+)?|1(?:[.·]0+)?))/,
  STATEMENTS: [
    [1, "Authors: strong association", /\b(?:strong(?:ly)?|robust(?:ly)?|marked(?:ly)?|substantial(?:ly)?|considerabl[ey]|significantly)\s+(?:and \w+ )?(?:positive(?:ly)? )?(?:associat\w*|increased? risk|elevated risk|higher risk)/i],
    [1, "Authors: risk increased", /\b(?:(?:two|three|four|five|\d+(?:[.·]\d+)?)[- ]?fold (?:increase|higher|greater|elevated|risk)|doubl(?:ed|ing) (?:of )?(?:the )?risk)/i],
    [0, "Authors: weak/modest association", /\b(?:weak(?:ly)?|modest(?:ly)?|slight(?:ly)?|small|marginal(?:ly)?)\s+(?:but \w+ )?(?:positive(?:ly)? )?(?:associat\w*|increase in risk|increased risk|elevated risk)/i],
    [-1, "Authors: no association", /\bno (?:significant |statistically significant |clear |meaningful |appreciable |consistent |evidence of (?:an? )?)?(?:associat\w*|relationship|increased? (?:in )?risk|link)\b|\b(?:was|were) not (?:significantly |statistically significantly )?associated\b/i],
    [-1, "Authors: not significant", /\bnot (?:statistically )?significant(?:ly)?\b|\bdid not reach (?:statistical )?significance\b|\bnon-?significant\b/i],
  ],
  terms(s) { return (s || "").split(/[,;\n]/).map(t => t.trim().toLowerCase()).filter(t => t.length > 1); },
  count(text, terms) {
    const low = text.toLowerCase(); let n = 0;
    for (const t of terms) { const re = new RegExp("\\b" + t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "[\\s-]+"), "i"); if (re.test(low)) n++; }
    return n;
  },
  num: s => parseFloat(s.replace("·", ".")),
  evalue(r) { if (r < 1) r = 1 / r; return r + Math.sqrt(r * (r - 1)); },
  grade(e) {
    const r = e.est >= 1 ? e.est : 1 / e.est, sig = e.lo > 1 || e.hi < 1;
    const size = r >= 5 ? "Very strong" : r >= 2 ? "Strong" : r >= 1.5 ? "Moderate" : r > 1.1 ? "Weak" : "Near null";
    const evCI = !sig ? 1 : this.evalue(e.est > 1 ? e.lo : e.hi);
    return { r, sig, size, dir: e.est > 1 ? "increased" : e.est < 1 ? "decreased" : "none", ev: this.evalue(e.est), evCI,
      ciRatio: e.lo > 0 ? e.hi / e.lo : Infinity, doubling: e.est >= 2, doublingLo: e.lo >= 2 };
  },
  scan(sentences, focus = {}) {
    const ex = this.terms(focus.exposure), out = this.terms(focus.outcome), focused = ex.length + out.length > 0;
    const ests = [], stmts = [];
    const win = i => {
      const s = sentences[i], back = s.section === "Tables & appendix" ? 15 : 2;
      let t = "";
      for (let k = i - 1; k >= Math.max(0, i - back) && sentences[k].section === s.section; k--) t = sentences[k].text + " " + t;
      return t;
    };
    sentences.forEach((s, si) => {
      const t = s.text.replace(/·/g, ".");
      const others = this.OTHER_STUDIES.test(t);
      const wordMs = [...t.matchAll(this.MEAS_WORD)].map(m => [m.index, m[1]]);
      const abbrMs = [...t.matchAll(this.MEAS_ABBR)].map(m => [m.index, m[1]]);
      const meas = wordMs.concat(abbrMs).sort((a, b) => a[0] - b[0]);
      const re = this.EST_RE; let m, prevEnd = 0;
      while ((m = re.exec(t))) {
        const est = this.num(m[1]), lo = this.num(m[5]), hi = this.num(m[6]);
        const labelled = !!(m[3] || m.groups?.lev2), bracket = !!m[2];
        const before = t.slice(Math.max(prevEnd, m.index - 220), m.index);
        const nearMeas = meas.filter(x => x[0] < m.index && x[0] >= m.index - 250).pop() || meas.find(x => x[0] > m.index && x[0] < m.index + 80 + m[0].length) || meas[0];
        const decimals = /[.]/.test(m[1] + m[5] + m[6]);
        if (!(lo <= est && est <= hi && lo >= 0 && hi > 0 && hi < 1000 && lo !== hi)) continue;
        if (!labelled && !nearMeas && !(decimals && bracket && /Results|Tables|Abstract/.test(s.section))) continue;
        if (!labelled && this.NOT_EST.test(before.slice(-40))) continue;
        if (!decimals && !labelled && !nearMeas) continue;
        const after = t.slice(m.index + m[0].length, m.index + m[0].length + 90);
        const p = this.P_RE.exec(after);
        const ctx = before + " " + m[0] + " " + after.split(/[;]|\.\s/)[0];
        const e = { ...s, est, lo, hi, level: m[3] || m.groups?.lev2 || "95", raw: m[0].trim(), start: m.index, end: m.index + m[0].length,
          measure: nearMeas ? this.norm(nearMeas[1]) : "Ratio (type not stated)", p: p ? p[1].replace(/\s+/g, "") : null,
          adjusted: this.ADJ.test(ctx) || this.ADJ.test(t) && !this.CRUDE.test(t), crude: this.CRUDE.test(ctx),
          subgroup: this.SUBGROUP.test(ctx), others, context: before.replace(/^\S*\s/, "").trim() };
        e.g = this.grade(e);
        const exLocal = this.count(ctx, ex), outLocal = this.count(ctx, out), exS = this.count(t, ex), outS = this.count(t, out);
        e.rel = focused ? (exLocal * 2 + exS) * (ex.length ? 1 : 0) + (outLocal * 2 + outS) * (out.length ? 1 : 0) : 0;
        const near = focused ? win(si) : "";
        const exOk = !ex.length || exS > 0, outOk = !out.length || outS > 0;
        e.match = !focused || ((exOk || this.count(near, ex) > 0) && (outOk || this.count(near, out) > 0));
        e.inherited = focused && e.match && !(exOk && outOk);
        const secW = { Results: 2, Abstract: 1.5, "Tables & appendix": 1.2, Methods: 0.3, Discussion: 0.5, Conclusion: 0.8, Introduction: -2, "Front matter": 0 }[s.section] ?? 0;
        e.priority = e.rel * 3 + (e.match ? (e.inherited ? 2.5 : 4) : 0) + secW + (e.adjusted ? 2 : 0) - (e.crude ? 1 : 0) - (e.subgroup ? 1 : 0) - (others ? 4 : 0) + (e.measure.startsWith("Ratio") ? -0.5 : 0);
        ests.push(e); prevEnd = m.index + m[0].length;
      }
      for (const [w, label, r] of this.STATEMENTS) {
        const mm = r.exec(t); if (!mm) continue;
        const match = !focused || ((!ex.length || this.count(t, ex)) && (!out.length || this.count(t, out)));
        stmts.push({ ...s, w, label, start: mm.index, end: mm.index + mm[0].length, match, others });
        break;
      }
    });
    const rel = ests.filter(e => e.match).sort((a, b) => b.priority - a.priority || a.a - b.a);
    const rest = ests.filter(e => !e.match).sort((a, b) => a.a - b.a);
    const pool = rel.filter(e => !e.others && e.section !== "Introduction");
    const primary = pool[0] || rel[0] || null;
    const sum = { n: pool.length, up: pool.filter(e => e.g.sig && e.est > 1).length, down: pool.filter(e => e.g.sig && e.est < 1).length, nul: pool.filter(e => !e.g.sig).length };
    let verdict, tone;
    if (!primary) { verdict = focused ? "No estimates found for this focus" : "No ratio estimates found"; tone = "none"; }
    else {
      const g = primary.g;
      if (!g.sig) { verdict = `Not statistically significant (${primary.measure} ${primary.est})`; tone = "bad"; }
      else if (g.dir === "decreased") { verdict = `${g.size} inverse association (${primary.measure} ${primary.est})`; tone = "mid"; }
      else { verdict = `${g.size} association (${primary.measure} ${primary.est})`; tone = g.r >= 2 ? "good" : "mid"; }
    }
    return { focused, ests: rel, rest, stmts: stmts.filter(s => s.match).sort((a, b) => (a.others - b.others) || a.a - b.a), primary, verdict, tone, sum };
  },
};
