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
  // { title: "Tool name", description: "One-line description.", file: "analysis-tools/tool-name.html",
  //   languages: ["Python"], topics: ["Dementia Research"] },
];

// PROJECTS — multi-page projects. Files go in /projects/<id>/. Each card opens project.html?p=<id>.
const projects = [
  // { id: "computer-vision", title: "Computer Vision", description: "One-line description.",
  //   pages: [
  //     { title: "Step 1", description: "Optional.", file: "projects/computer-vision/step1.html" },
  //     { title: "Step 2", file: "projects/computer-vision/step2.html" },
  //   ] },
];

// CREATIVE — fun HTMLs, no tags. Files go in /creative.
const creative = [
  // { title: "Piece name", description: "One-line description.", file: "creative/piece-name.html" },
];

// EDUCATION — teaching HTMLs and slides. Files go in /education.
// PDFs open in the browser, .pptx/.key download. Optional thumbnail: "education/talk-name.png".
const education = [
  // { title: "Talk name", description: "One-line description.", file: "education/talk-name.pdf" },
];
