// All site content lives here. Add an entry, drop the file(s) in the matching folder, commit and push.

// WORK — single HTMLs, filterable by language and topic. Files go in /work.
const work = [
  // { title: "Project name", description: "One-line description.", file: "work/project-name.html",
  //   languages: ["R", "SQL"], topics: ["Dementia Research"] },
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
  // { title: "Piece name", description: "One-line description.", file: "creative/piece-name.html" },
];

// EDUCATION — teaching HTMLs and slides. Files go in /education.
// PDFs open in the browser, .pptx/.key download. Optional thumbnail: "education/talk-name.png".
const education = [
  // { title: "Talk name", description: "One-line description.", file: "education/talk-name.pdf" },
];
