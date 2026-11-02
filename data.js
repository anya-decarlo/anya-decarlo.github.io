// All site content lives here. Add an entry, drop the file(s) in the matching folder, commit and push.

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
  // { title: "Piece name", description: "One-line description.", file: "creative/piece-name.html" },
];

// EDUCATION — teaching HTMLs and slides. Files go in /education.
// PDFs open in the browser, .pptx/.key download. Optional thumbnail: "education/talk-name.png".
const presentations = [
  // { id: "talk-name", title: "Talk name", description: "What it covers.",
  //   file: "presentations/talk-name/slides.pdf", thumbnail: "presentations/talk-name/cover.png" },
];

const education = [
  // { title: "Talk name", description: "One-line description.", file: "education/talk-name.pdf" },
];
