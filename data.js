// All site content lives here. Add an entry, drop the file(s) in the matching folder, commit and push.

// SEC — pieces built to match the SEC role. Files go in /sec. Same fields as Work; tags optional.
const sec = [
  { title: "Recurring Reports: Weekly Late Filers",
    description: "A weekly report on companies that told the SEC they'd miss a 10-K or 10-Q deadline (NT 10-K and NT 10-Q notices), built on two years of real EDGAR data that a scheduled GitHub Action refreshes every Monday. It matches each notice to the company's next 10-K or 10-Q to show whether it filed within the Rule 12b-25 extension. It has week-over-week and year-over-year measures, filters for form, industry, location and listing, alerts for repeat filers, missed extensions and volume spikes, and Public, Analyst and Compliance admin views. Every measure is documented on the page.",
    languages: ["Python", "JavaScript"],
    topics: ["SEC EDGAR", "Recurring Reports"],
    file: "sec/late-filers/index.html" },
  { title: "Semantic Models: Reconciled Financial Statements",
    description: "Companies tag the same number differently in XBRL. Revenue alone shows up under three us-gaap tags. This model reconciles 269,000 FY2024 facts from every SEC filer into 15 business concepts. It documents the source tags in precedence order, a definition for each concept, the relationships from company to filing to fact to concept to metric, and the calculation logic for seven ratios. Gaps are filled from accounting identities, six quality checks run on every company, and a lineage explorer traces each value to the filing it came from. The clean dataset (6,312 companies) downloads as CSV, and the whole model is a single model.json spec.",
    languages: ["Python", "JavaScript"],
    topics: ["SEC EDGAR", "XBRL", "Semantic Models"],
    file: "sec/semantic-model/index.html" },
];

// WORK — single HTMLs, filterable by language and topic. Files go in /work.
const work = [
  // { title: "Project name", description: "One-line description.", file: "work/project-name.html",
  //   languages: ["R", "SQL"], topics: ["Dementia Research"] },
  { title: "Heart Disease Risk: Linear and Logistic Regression on HERS and WCGS",
    description: "Regression in R on real study data. Tests for a linear trend between physical activity and HDL cholesterol in the HERS trial and whether age and BMI confound it; diagnoses non-normal residuals and influential points (Cook's distance, DFBETAS) in a birth-weight model; and uses logistic regression on the Western Collaborative Group Study to estimate how smoking, measured as yes/no, cigarettes per day, and packs per day, raises the odds of coronary heart disease.",
    file: "work/biostats-208-final/final.pdf", thumbnail: "work/biostats-208-final/cover.png",
    languages: ["R"], topics: ["Health Data", "Cardiovascular Research"] },
  { title: "Survival Analysis: Cox Models for Liver Disease and HIV Treatment",
    description: "Cox proportional hazards models in R on two clinical datasets. In primary biliary cirrhosis, tests whether liver histology grade predicts death after adjusting for bilirubin (likelihood ratio test, grade-to-grade hazard ratios, a trend test), and finds that bilirubin rising 4.72 mg/dL doubles the risk of death. In the ACTG 019 HIV trial, derives and fits a treatment by CD4 interaction showing that ZDV's benefit grows with CD4 count: hazard ratio 0.09 versus placebo at 500 cells, but no benefit at 50.",
    file: "work/stats/cox-survival-pbc-actg.html",
    languages: ["R"], topics: ["Health Data", "Survival Analysis"] },
  { title: "Repeated Measures: Mixed Models and GEE for Birth Weight and Knee Osteoarthritis",
    description: "Longitudinal models in R on three datasets. For 1,000 Georgia births from 200 mothers, fits mixed models with mom-specific intercepts and birth-order trends, tests whether random slopes improve the fit (they don't, p = 0.11), compares the conclusion with GEE, and interprets the variance components. In the Osteoarthritis Initiative, uses a log-link GEE to test whether BMI and sex change severe knee pain over time, then models how the odds of slow walking (under 1 m/s) rise with age and differ by race, weighing GEE against mixed models and checking each GEE assumption.",
    file: "work/stats/repeated-measures-mixed-models-gee.html",
    languages: ["R"], topics: ["Health Data", "Longitudinal Analysis"] },
  { title: "Missing Data in Longitudinal Blood Pressure: GEE vs. Mixed Models",
    description: "A statistical write-up on how missing data can flip a study's conclusion. With 47% of year-one blood pressure readings missing, I show the missingness tracks baseline SBP (Cohen's d = 2.01), diabetes and BMI, classify three hypothetical mechanisms as MCAR, MAR or NMAR, then compare models: a complete-case GEE finds a significant 7.3 mmHg drop in SBP, while a mixed model using all available data under MAR finds no change, matching the full data. Explains why, and why the mixed model is the more trustworthy answer.",
    file: "work/missing-data-gee-mixed/writeup.pdf", thumbnail: "work/missing-data-gee-mixed/cover.png",
    languages: ["R"], topics: ["Health Data", "Longitudinal Analysis"] },
  { title: "Bayesian Methods with a Coordinate Citation System",
    description: "Bayesian foundations worked through from first principles: eliciting a Beta prior and its effective sample size, Beta-Binomial conjugacy, posterior vs. posterior predictive distributions, why Monte Carlo and MCMC averages converge, and posterior predictive checks, followed by first Bernoulli and logistic regression models in brms. Every formula and definition carries a coordinate citation like [week5/week-5-lecture.txt:170-173], pointing to the exact lines in a plain-text copy of the source material, a referencing system I built so any claim can be checked against its source.",
    file: "work/stats/bayesian-coordinate-citations.html",
    languages: ["R"], topics: ["Bayesian Statistics"] },
  { title: "Bayesian Baseball: Estimating True Batting Ability Across 141 Years of MLB",
    description: "A Beta-Binomial analysis in R of every MLB batting season from 1871 to 2012 (Lahman database, 83,361 player-seasons). It estimates each player's true batting probability under three priors (empirical Bayes, an expert prior at the historical .270, and a weakly informative prior), shows how prior strength controls shrinkage toward the league average of .262, then measures how much players' averages swing from season to season and folds that into the prior. Trained on seasons before 2010 and tested on 2010–12, the season-to-season adjustment improves prediction for every prior, cutting the expert prior's RMSE from 0.046 to 0.038. Includes posterior predictive checks, MCMC diagnostics and a prior sensitivity analysis.",
    file: "work/stats/bayesian-baseball-batting.html",
    languages: ["R"], topics: ["Sports Data", "Bayesian Statistics"] },
  { title: "Predicting Blood Pressure: Linear, Polynomial and Kernel Regression",
    description: "Predicts systolic from diastolic blood pressure in NHANES, training on the 2009–10 survey and testing on 2011–12. I compare linear, quadratic and cubic fits with ANOVA, try kernel smoothing at three bandwidths, then check which model actually wins on test-set mean squared error.",
    file: "work/ml/nhanes-blood-pressure-regression.html",
    languages: ["R"], topics: ["Machine Learning", "Health Data"] },
  { title: "Classifying Diabetes and Dementia: Logistic Regression, LDA and Lasso",
    description: "Predicts diabetes in NHANES from blood pressure and age with logistic regression and linear discriminant analysis, comparing confusion matrices, sensitivity and specificity, ROC curves and thresholds (multi-predictor AUC 0.81), and shows how changing LDA's prior probabilities shifts what it catches. Then uses cross-validated lasso to classify dementia and pick out which predictors survive the penalty.",
    file: "work/ml/diabetes-dementia-classification.html",
    languages: ["R"], topics: ["Machine Learning", "Health Data", "Dementia Research"] },
  { title: "SVMs, Random Forests and Gradient Boosting on Dementia MRI and Prostate Cancer Genes",
    description: "Builds a maximum-margin classifier by hand to show which new points do and don't move the decision boundary, then trains a radial SVM to tell dementia subtypes apart from structural MRI brain-loss measures (67% test accuracy vs 29% by chance). On a 12,000-gene prostate cancer dataset, compares a tuned random forest with XGBoost by AUC and finds which gene each model ranks most important, using SHAP values for the boosted trees.",
    file: "work/ml/svm-random-forest-boosting.html",
    languages: ["R"], topics: ["Machine Learning", "Dementia Research", "Cancer Research"] },
  { title: "Gradient Boosting and K-means on the I-SPY Breast Cancer Trial",
    description: "Predicts final tumor diameter on MRI in the I-SPY breast cancer trial from earlier timepoints. I hand-build site-wise cross-validation (holding out whole sites, not random rows) to tune a gradient boosted model's trees and depth; it explains 53% of the variance on held-out sites. Then clusters patients with K-means, choosing k by silhouette, and compares tumor outcomes across the clusters.",
    file: "work/ml/ispy-boosting-kmeans.html",
    languages: ["R"], topics: ["Machine Learning", "Cancer Research"] },
];

// ANALYSIS TOOLS — interactive tools, filterable like Work. Files go in /analysis-tools.
const analysisTools = [
  { title: "Waveform Annotation Platform",
    description: "An audio review tool I built to quality-check 795 participant speech recordings for BHR dementia research. It renders each waveform with zoom and playback-speed controls, lets reviewers drag to annotate time ranges (green flags, red flags, analysis ideas, questions, transcription notes), flag issues like crosstalk, cutoffs, accents, or background noise, rate recordings 1–5, verify transcriptions, and export everything to CSV. Interface preview only; it runs against a local server and audio files.",
    file: "analysis-tools/waveform-annotation-platform.html",
    languages: ["JavaScript"], topics: ["Dementia Research"] },
  { title: "Emotion Arc Viewer",
    description: "A real analysis tool I built to understand and keep the emotion data Hume's API returns. The conversations are open-sourced from Hume's API: one chat with Hume's voice AI, exported as 109 segments covering different parts of the same conversation. For each segment it charts the emotional arc of my 1,586 replies and shows what the AI said right before, what I said back, the top 5 of Hume's 48 emotion scores, and the segment's mean intensity and volatility.",
    file: "analysis-tools/emotion-arc-viewer/index.html",
    languages: ["JavaScript"], topics: ["Large Language Models"] },
  // { title: "Tool name", description: "One-line description.", file: "analysis-tools/tool-name.html",
  //   languages: ["Python"], topics: ["Dementia Research"] },
];

// PROJECTS — multi-page projects. Files go in /projects/<id>/. Each card opens project.html?p=<id>.
const projects = [
  { id: "computer-vision", title: "Computer Vision: Pixel Extraction & Reconstruction",
    description: "A browser toolkit that turns an image into pixel data and back at native resolution: every single pixel becomes its own CSV row with its position and hex color. Extract Pixels creates the CSV; the reconstructors redraw the image from it, with grid overlays or only the colors and quadrants you pick, and export it as SVG. I built it to reverse-engineer display fonts and lift handwriting off scanned notebook pages.",
    tryIt: {
      text: "Download the sample image (or use your own), open Extract Pixels to turn it into a CSV, then load that CSV into the reconstructors.",
      downloads: [
        { label: "Sample image (PNG)", file: "projects/computer-vision/sample-image.png" },
      ],
    },
    pages: [
      { title: "1. Extract Pixels", file: "projects/computer-vision/1-extract-pixels.html",
        description: "Upload any image and export every pixel at native resolution to CSV: x, y, grid quadrant, distance from center, and hex color." },
      { title: "2. Reconstruct with Grid Overlay", file: "projects/computer-vision/2-reconstruct-grid-overlay.html",
        description: "Redraws the full image pixel by pixel from the CSV, with a translucent yellow 10-pixel grid layered on top to check the extraction." },
      { title: "3. Reconstruct with 64 Quadrants", file: "projects/computer-vision/3-reconstruct-64-quadrants.html",
        description: "Redraws the image from the CSV and overlays a labeled 8×8 grid (Q0–Q63), so you can see which quadrants hold the text before filtering." },
      { title: "4. Quadrant Hex Reconstructor", file: "projects/computer-vision/4-quadrant-hex-reconstructor.html",
        description: "Rebuilds the image quadrant by quadrant, with global and per-quadrant color selection, and exports the result as SVG." },
      { title: "5. Selective Reconstructor", file: "projects/computer-vision/5-selective-reconstructor.html",
        description: "Reconstructs only the hex codes and quadrants you list, isolating text or shapes from the background." },
      { title: "6. SVG Generator", file: "projects/computer-vision/6-svg-generator.html",
        description: "Turns any x, y, hex CSV (like the filtered output of the reconstructors) into a vector SVG you can download." },
    ] },
  { id: "bradford-hill", title: "Bradford Hill Evidence Pipeline",
    description: "A browser pipeline for expert causation review, built for lawyers. It turns study PDFs into fixed plain-text files and will scan them for evidence on the nine Bradford Hill factors experts use to judge whether a study supports causal inference, with every finding cited back to exact lines of the source. Articles never leave your browser. In progress: more steps coming.",
    pages: [
      { title: "1. PDF to Text", file: "projects/bradford-hill/1-pdf-to-text.html",
        description: "Upload article PDFs and convert each to a plain .txt, page by page, with a page-break marker after every page so line numbers stay fixed for citation. Download the .txt or keep it saved in the browser for the next steps." },
      { title: "2. Coordinate System", file: "projects/bradford-hill/2-coordinate-system.html",
        description: "Opens a .txt with every line numbered and page breaks marked. Click or select lines to get a citation like [article.txt:170-173] (p. 4), jump to any coordinate, search the text, collect citations into a list, and download the full line-by-line coordinate table as CSV for the parser." },
      { title: "3. Bradford Hill Factors", file: "projects/bradford-hill/3-bradford-hill-factors.html",
        description: "The same numbered coordinate view and search, side by side with a panel for each of the nine Hill factors, from temporal relationship to consistency with other knowledge. Temporal relationship scans the whole article, skipping the reference list, for study design (prospective, cohort, randomized vs cross-sectional, case-control), exposure measured before the outcome, outcome-free baseline, follow-up length and latency, reverse-causation checks such as lag analyses, and the authors' own stated limits. It handles negation and down-weights the introduction and mentions of other studies, then gives a verdict, a six-point checklist and every flagged passage marked as supporting or weakening, each with its coordinate. Strength of association pulls every ratio estimate (HR, RR, OR, IRR, SMR) with its confidence interval and p-value, ranks them against an optional exposure and outcome you type in, and grades the primary estimate: magnitude, statistical significance, precision, whether it reaches a doubling of risk, and its E-value for unmeasured confounding, alongside the authors' own characterizations. The other factors are next." },
    ] },
  { id: "ehr-billing-coding", title: "EHR Billing & Coding",
    description: "Tools I'm building for medical billing and coding, starting with packet loss in EHR records. Instead of nested, string-keyed databases, every field gets a permanent numeric coordinate, like the line numbers on a tax form, so each value can be stored and retrieved exactly, with an audit trail. In progress: more pages coming.",
    pages: [
      { title: "1. How It Works (Poster)", file: "projects/ehr-billing-coding/1-how-it-works-poster.html",
        description: "The concept explained as a poster: three layers (UI fields, coordinate mapping, graph storage), each vital pre-mapped to a fixed point in 6-dimensional space, a flat 'pancake' mapping in place of nested patient/vitals/date records, the store-and-retrieve flow with its audit trail, and the JavaScript behind it." },
      { title: "2. Coordinate-Based Data Retrieval", file: "projects/ehr-billing-coding/2-coordinate-data-retrieval.html",
        description: "A minimal prototype: enter blood pressure, heart rate, temperature and oxygen saturation, and each value is stored under its field's fixed six-number coordinate. Retrieve vitals looks each field up by coordinate alone, a map shows every stored value with its coordinate, and an access log records each retrieval with a timestamp." },
    ] },
  // { id: "computer-vision", title: "Computer Vision", description: "One-line description.",
  //   pages: [
  //     { title: "Step 1", description: "Optional.", file: "projects/computer-vision/step1.html" },
  //     { title: "Step 2", file: "projects/computer-vision/step2.html" },
  //   ] },
];

// CREATIVE — fun HTMLs, no tags. Files go in /creative.
const creative = [
  { title: "Hall of Mirrors",
    description: "A website redesign concept for William Lasry, built with my own pixel reconstructor. I pulled the LASRY display wordmark off his site, extracted every pixel, rebuilt it as an SVG with my Quadrant Hex Reconstructor, and set it inside a hall of glassy blue mirror panels that shimmer at random, tilt in 3D as you move your mouse, and glow under the cursor.",
    file: "creative/hall-of-mirrors/index.html" },
  { title: "ВОЛЯ — The Will Engine",
    description: "Probate across the multiverse, built in one night by Team Innosync. A grandmother's will floats in a WebGL quantum realm, each clause blurred between three possible readings. Hover on a clause until its ring fills and it collapses into one reading with a burst of gold and a bell chime. Each one recovers part of a $1,000,000 inheritance, until the will is executed and her honor is restored. Best with sound on.",
    file: "creative/volya/index.html" },
  { title: "Emotional Experiences",
    description: "12 feelings translated into code. A menu of animated pages where each emotion is built from motion, color, and timing: Overwhelming Calm drifts like bioluminescence underwater on 60-second cycles, Aggressive Joy attacks with confetti and screen shake, Infinite Depth dives through 10 parallax layers that follow your mouse, and Silent Loudness flickers moiré patterns so fast it feels loud with no sound. Also: Nostalgic Future, Organic Machine, Melting Reality, Crystalline Precision, Comfortable Chaos, Hyper-Awareness, plus two newer ones: Warm Solitude and Electric Anticipation. Contains rapid flashing.",
    file: "creative/emotional-experiences/index.html" },
  { title: "Bite Counter",
    description: "A webcam bite counter. It tracks your mouth with MediaPipe's 478-point face mesh, measures how far your lips open relative to your face height, and counts each open-and-close as a bite or a chew depending on how wide it got. The live feed is overlaid with a grid that bends along the image's edges, contour lines traced from its brightness, and a scrolling trace of your mouth opening. Needs camera access; the video stays in your browser.",
    file: "creative/body-curves/index.html" },
  { title: "Earth Rotation",
    description: "A 3D Earth in three.js spinning at 60× real speed on its 23.44° tilt inside 10,000 stars. It drops a red marker at your GPS location and shows how fast the rotation is carrying you at your latitude (about 1,670 km/h at the equator). Star Gazing Mode puts the camera on your spot looking north, and on a phone it reads your compass and tilt to tell you when you're lying down, level, and facing north, so the stars move right to left overhead. Asks for your location; it stays in your browser.",
    file: "creative/earth-rotation/index.html", thumbnail: "creative/earth-rotation/cover.png" },
  { title: "Amazing Grid: Live Clothing Palettes",
    description: "Point your camera at a piece of clothing and build its color palette live. The feed gets a lettered 10×10 grid (A-1 to J-10) over a fine pink 10-px grid, and hovering opens a magnifier on a 10×10-pixel patch with every pixel's coordinates labeled. Click to grab one pixel's hex (copied to your clipboard), or click the magnifier to capture every unique color in the patch. Brightness, zoom and pan tune the feed, and each palette is saved with the item's brand, size, material, origin, price and care instructions into a wardrobe inventory you can download as CSV. Needs camera access; the video stays in your browser.",
    file: "creative/amazing-grid/index.html", thumbnail: "creative/amazing-grid/cover.png" },
  // { title: "Piece name", description: "One-line description.", file: "creative/piece-name.html" },
];

// EDUCATION — teaching HTMLs and slides. Files go in /education.
// PDFs open in the browser, .pptx/.key download. Optional thumbnail: "education/talk-name.png".
const presentations = [
  // { id: "talk-name", title: "Talk name", description: "What it covers.",
  //   file: "presentations/talk-name/slides.pdf", thumbnail: "presentations/talk-name/cover.png" },
];

const education = [
  { title: "Posterior Precision Visualizer",
    description: "An interactive lesson on why Bayesian posteriors get more certain. Sliders set the prior SD (τ₀), the observation SD (σ) and the sample size (n), and the page updates the formula 1/τₙ² = 1/τ₀² + n/σ² live: prior, data and posterior precision side by side, plus how precision grows with n, how it falls as data get noisier, and a 3D surface of both at once. The point it makes visible: precision adds up, so more or cleaner data always shrinks the posterior.",
    file: "education/posterior-precision-visualizer.html" },
  { title: "18 Speech Features Linked to Cognitive Performance",
    description: "A reference table of the 18 speech features that stayed significant after FDR correction (Benjamini-Hochberg, q < 0.05), each with its mathematical definition. It covers part-of-speech counts from spaCy (adjectives, nouns, pronouns, interjections like \"um\"), lexical diversity as a moving-average type-token ratio and phonemes per second, Praat timing measures (speaking time, mean pause length, pause rate, percent speech), and openSMILE eGeMAPS acoustics (unvoiced-segment variability, loudness peaks, spectral flux).",
    topics: ["Dementia Research", "Linguistic", "Auditory"],
    file: "education/speech-features-table.html" },
  // { title: "Talk name", description: "One-line description.", file: "education/talk-name.pdf" },
];
