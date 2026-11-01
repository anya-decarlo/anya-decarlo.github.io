// All site content lives here. Add an entry, drop the file(s) in the matching folder, commit and push.

// WORK — single HTMLs, filterable by language and topic. Files go in /work.
const work = [
  // { title: "Project name", description: "One-line description.", file: "work/project-name.html",
  //   languages: ["R", "SQL"], topics: ["Dementia Research"] },
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
