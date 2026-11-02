// Factor 1: Temporal relationship. Rule-based screen of an article's sentences.
// Each rule adds weight w (positive = supports exposure-before-outcome, negative = weakens it).
const NOT_FUTURE = "(?<!(?:future|further|larger|additional|more|well-designed) )";
const NOT_NEEDED = "(?![^.;]{0,30}\\b(?:needed|warranted|required|necessary)\\b)";
const R = (s, f = "i") => new RegExp(s, f);
const TEMPORAL = {
  name: "Temporal relationship",
  cats: [
    ["design", "Study design"],
    ["order", "Exposure measured before outcome"],
    ["baseline", "Outcome-free at baseline"],
    ["followup", "Follow-up and latency"],
    ["reverse", "Reverse-causation checks"],
    ["limits", "Authors' stated limits"],
  ],
  rules: [
    // Study design
    ["design", 3, "Prospective design", R(NOT_FUTURE + "\\bprospective(?:ly)?\\b" + NOT_NEEDED)],
    ["design", 3, "Randomized design", R(NOT_FUTURE + "\\b(?:randomi[sz]ed|randomly (?:assigned|allocated))\\b" + NOT_NEEDED)],
    ["design", 1.5, "Longitudinal design", R(NOT_FUTURE + "\\blongitudinal(?:ly)?\\b" + NOT_NEEDED)],
    ["design", 1.5, "Cohort design", R("\\bcohort\\b")],
    ["design", 2, "Nested case-control", R("\\bnested case[- ]control\\b")],
    ["design", 2, "Self-controlled / quasi-experimental design", R("\\b(?:case[- ]crossover|self[- ]controlled|interrupted time[- ]series|target trial)\\b")],
    ["design", -0.5, "Retrospective data", R("\\bretrospective(?:ly)?\\b(?! cohort)")],
    ["design", -3, "Cross-sectional design", R("\\bcross[- ]sectional(?:ly)?\\b")],
    ["design", -2.5, "Ecological design", R("\\becolog(?:ic|ical) (?:study|studies|design|analys[ie]s|data|fallacy)\\b")],
    ["design", -1.5, "Case-control (exposure recalled after outcome)", R("(?<!nested )\\bcase[- ]control\\b")],
    ["design", -1, "Case series / report", R("\\bcase (?:series|reports?)\\b")],
    // Exposure measured before outcome
    ["order", 2, "Exposure measured at baseline", R("\\b(?:at|during) (?:the )?baseline\\b|\\bbaseline (?:exposure|measure\\w*|assessment|questionnaire|interview|visit|examination|survey|levels?|data|blood|samples?)\\b")],
    ["order", 2, "Exposure before outcome", R("\\b(?:prior to|before|preceding|preceded|predat\\w*|antedat\\w*|in advance of)\\b[\\w\\s,-]{0,40}\\b(?:diagnos\\w*|onset|outcome|event|disease|development|symptoms?|death|incidence)\\b")],
    ["order", 2.5, "Prospectively collected exposure data", R("\\bprospectively (?:collected|recorded|ascertained|measured|assessed|gathered)\\b")],
    ["order", 2.5, "Prediagnostic exposure", R("\\bpre-?diagnos(?:tic|is)\\b")],
    ["order", 1.5, "Outcome assessed afterward", R("\\b(?:subsequent(?:ly)?|later|future)\\b[\\w\\s-]{0,20}\\b(?:risk|develop\\w*|incidence|diagnos\\w*|onset|occurrence)\\b")],
    ["order", 1.5, "Outcome occurred after exposure", R("\\b(?:develop\\w*|diagnosed|occurr\\w*)\\b[\\w\\s-]{0,15}\\b(?:after|following|subsequent to)\\b")],
    // Outcome-free at baseline
    ["baseline", 2.5, "Outcome-free at baseline", R("\\b(?:free (?:of|from)|without)\\b[\\w\\s,-]{0,40}\\b(?:at|before) (?:baseline|enrol?lment|entry|recruitment|study entry|inclusion)\\b")],
    ["baseline", 2.5, "Prevalent cases excluded", R("\\bexclu\\w*\\b[\\w\\s,-]{0,60}\\b(?:prevalent|pre-?existing|history of|prior (?:diagnosis|history)|baseline (?:disease|cases?|diagnosis)|already (?:had|diagnosed))\\b|\\b(?:prevalent|pre-?existing) (?:cases?|disease|conditions?)\\b[\\w\\s,-]{0,40}\\bexclu\\w*")],
    ["baseline", 1.5, "Incident cases", R("\\bincident\\b(?! (?:report|light|angle))")],
    ["baseline", 1.5, "New-onset cases / new users", R("\\bnew[- ]onset\\b|\\bnewly (?:diagnosed|developed)\\b|\\bnew[- ]users?\\b")],
    ["baseline", 1.5, "Disease-free population", R("\\b(?:disease|cancer|event|dementia|tumou?r)[- ]free\\b")],
    // Follow-up and latency
    ["followup", 2, "Follow-up duration", R("\\bfollow(?:ed)?[- ]?up\\b[^.;]{0,50}?\\b\\d+(?:\\.\\d+)?(?:\\s*(?:-|\\u2013|to)\\s*\\d+(?:\\.\\d+)?)?\\s*(?:years?|yrs?|months?|weeks?|days?)\\b|\\bfollowed\\b[^.;]{0,80}?\\bfor\\b[^.;]{0,25}?\\d+(?:\\.\\d+)?\\s*(?:years?|months?|weeks?|days?)\\b")],
    ["followup", 1.5, "Person-time of follow-up", R("\\b\\d[\\d,.]*\\s*(?:person|patient|participant)[- ](?:years|months)\\b")],
    ["followup", 2, "Latency / induction period", R("\\blaten(?:cy|t period)\\b|\\binduction (?:period|time)\\b")],
    ["followup", 1, "Time-to-event analysis", R("\\btime[- ]to[- ](?:event|diagnosis|onset|death|first)\\b|\\bsurvival analys[ie]s\\b|\\bkaplan[- ]meier\\b|\\bcox\\b|\\bproportional hazards?\\b")],
    ["followup", 1.5, "Time-varying exposure", R("\\btime[- ](?:varying|dependent|updated)\\b")],
    // Reverse-causation checks
    ["reverse", 3, "Lag analysis", R("\\b(?:\\d+[- ](?:year|month)s?[- ])?lag(?:ged)? (?:analys[ie]s|period|time|exposure|window|of \\d)|\\b\\d+[- ](?:year|month)s?[- ]lag\\b|\\blagging\\b")],
    ["reverse", 3, "Early events excluded", R("\\bexclu\\w*\\b[^.;]{0,50}\\b(?:first|initial)\\s+(?:\\d+|one|two|three|four|five|six|ten)\\s*(?:years?|months?)\\b")],
    ["reverse", 3, "Reverse causation addressed", R("\\b(?:address|minimi[sz]|reduc|limit|account(?:ed|ing)? for|assess|examin|evaluat|explor|test|mitigat)\\w*\\b[^.;]{0,40}\\breverse (?:causa\\w*|causality)\\b")],
    ["reverse", 1.5, "Protopathic bias considered", R("\\bprotopathic\\b")],
    ["reverse", 2, "Causal method for time ordering", R("\\bmarginal structural\\b|\\btarget trial emulation\\b|\\bg-(?:formula|computation|estimation)\\b")],
    ["reverse", 0, "Mentions reverse causation", R("\\breverse (?:causa\\w*|causality)\\b")],
    // Authors' stated limits
    ["limits", -3, "Authors: temporality not established", R("\\b(?:cannot|can ?not|could not|unable to|did not allow|does not allow|not possible to|preclud\\w*|limits? (?:our )?ability to|impossible to)\\b[^.;]{0,50}\\b(?:temporal\\w*|causal\\w*|direction\\w*|time order\\w*|sequence)\\b")],
    ["limits", -3, "Authors: temporal order unclear", R("\\btemporal(?:ity| relationship| sequence| order\\w*| association)\\b[^.;]{0,40}\\b(?:unclear|uncertain|unknown|cannot|could not|not (?:be )?(?:established|determined|clear))\\b")],
    ["limits", -2.5, "Reverse causation not ruled out", R("\\breverse (?:causa\\w*|causality)\\b[^.;]{0,40}\\b(?:cannot|could not|can ?not|not)\\b[^.;]{0,15}\\b(?:ruled out|excluded|dismissed)\\b|\\b(?:possibility|potential|risk) of reverse (?:causa\\w*|causality)\\b")],
    ["limits", -1.5, "Exposure recalled after the fact", R("\\brecall bias\\b|\\bretrospectively (?:reported|recalled|collected)\\b|\\bself[- ]reported (?:past|prior|previous|history|lifetime)\\b")],
    ["limits", -1.5, "Authors call for prospective studies", R("\\b(?:future|further|larger|additional|more)\\b[^.;]{0,30}\\b(?:prospective|longitudinal|randomi[sz]ed)\\b[^.;]{0,30}\\b(?:studies|research|trials?|data|cohorts?)\\b")],
  ],
  NEGATION: /\b(?:not|no|non|neither|nor|lack(?:ed|s)? of|absence of|rather than|unlike)\s*(?:a |an |the )?[\w-]{0,12}\s*$/i,
  OTHER_STUDIES: /\b(?:previous|prior|earlier|other|recent) (?:studies|research|reports|investigations|work|trials|cohorts)\b|\bet al\b|\[\d+(?:[,\u2013-]\s*\d+)*\]/i,
  SECTION_WEIGHT: { Introduction: 0.4, "Tables & appendix": 0.6, "Back matter": 0.3 },

  scan(sentences) {
    const hits = [], best = {};
    for (const s of sentences) {
      const matches = [];
      let mult = this.SECTION_WEIGHT[s.section] ?? 1;
      const others = this.OTHER_STUDIES.test(s.text);
      if (others) mult *= 0.5;
      this.rules.forEach(([cat, w, label, re], k) => {
        const m = re.exec(s.text); if (!m) return;
        let ww = w, lab = label;
        if (w > 0 && cat !== "reverse" && this.NEGATION.test(s.text.slice(Math.max(0, m.index - 30), m.index))) { ww = -w * 0.7; lab += " (negated)"; }
        ww *= mult;
        matches.push({ cat, w: ww, label: lab, start: m.index, end: m.index + m[0].length, text: m[0], k });
        const key = k + (ww < 0 ? "-" : "+"), prev = best[key];
        if (!prev || Math.abs(ww) > Math.abs(prev.w)) best[key] = { cat, w: ww, label: lab, s };
      });
      if (!matches.length) continue;
      const score = matches.reduce((t, m) => t + m.w, 0);
      const top = matches.reduce((a, b) => (Math.abs(b.w) > Math.abs(a.w) ? b : a));
      hits.push({ ...s, matches, score, cat: top.cat, others });
    }
    // Category totals: each distinct rule counts once, at its strongest occurrence.
    const cat = {};
    for (const [id] of this.cats) cat[id] = { pos: 0, neg: 0, items: [] };
    for (const b of Object.values(best)) { const c = cat[b.cat]; if (b.w > 0) c.pos += b.w; else c.neg += b.w; if (b.w) c.items.push(b); }
    for (const c of Object.values(cat)) c.items.sort((a, b) => Math.abs(b.w) - Math.abs(a.w));
    const d = cat.design, sup = id => cat[id].pos >= 1.5;
    let verdict, tone;
    if (d.pos >= 2.5 && d.pos > -d.neg && (sup("baseline") || cat.reverse.pos >= 2 || cat.order.pos >= 2) && cat.limits.neg > -3) { verdict = "Supported"; tone = "good"; }
    else if ((d.pos >= 1.5 && d.pos > -d.neg) || cat.order.pos >= 2) { verdict = "Partly supported"; tone = "mid"; }
    else if ((d.neg <= -2.5 && d.pos < -d.neg) || cat.limits.neg <= -3) { verdict = "Not established"; tone = "bad"; }
    else { verdict = "Insufficient evidence"; tone = "none"; }
    const fu = hits.find(h => h.section !== "Introduction" && !h.others && h.matches.some(m => m.label === "Follow-up duration"));
    const followup = fu ? fu.matches.find(m => m.label === "Follow-up duration").text : null;
    hits.sort((a, b) => Math.abs(b.score) - Math.abs(a.score) || a.a - b.a);
    return { hits, cat, verdict, tone, followup, followupHit: fu };
  },
};
