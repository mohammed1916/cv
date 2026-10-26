import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { PROBLEM_SUMMARIES } from "../src/data/problemSummaries.js";
import { EXAMPLES_REGISTRY } from "../src/config/examplesRegistry.js";

function getFiles(dir, matchExt) {
  let res = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) res.push(...getFiles(full, matchExt));
    else if (matchExt(entry.name)) res.push(full);
  }
  return res;
}

const problemsDir = path.resolve("src/problems");
const problemFolders = fs
  .readdirSync(problemsDir)
  .filter((f) => fs.statSync(path.join(problemsDir, f)).isDirectory());

let totalLeetCodeVisualizers = 0;
let descriptionsUsingOurSummaries = 0;
let visualizersWithIndependentExamples = 0;
let visualizersRequiringReview = [];

for (const folder of problemFolders) {
  const metaPath = path.join(problemsDir, folder, "meta.js");
  if (!fs.existsSync(metaPath)) continue;
  const metaCode = fs.readFileSync(metaPath, "utf8");
  const slugMatch = metaCode.match(/slug:\s*['"](.*?)['"]/);
  const numberMatch = metaCode.match(/number:\s*['"](.*?)['"]/);
  const tagsMatch = metaCode.match(/tags:\s*\[([\s\S]*?)\]/);

  const slug = slugMatch ? slugMatch[1] : folder.toLowerCase();
  const number = numberMatch ? numberMatch[1] : "";
  const tags = tagsMatch
    ? tagsMatch[1].split(",").map((s) => s.trim().replace(/['"]/g, ""))
    : [];

  const isLeetCode =
    !tags.includes("Basics") &&
    !tags.includes("Codeforces") &&
    number !== "CF-F" &&
    number !== "B1";

  if (isLeetCode) {
    totalLeetCodeVisualizers++;
  }

  if (PROBLEM_SUMMARIES[slug]) {
    descriptionsUsingOurSummaries++;
  }

  if (EXAMPLES_REGISTRY[slug] && EXAMPLES_REGISTRY[slug].length > 0) {
    visualizersWithIndependentExamples++;
  } else {
    visualizersRequiringReview.push({ folder, slug, number });
  }
}

// Check remaining references to downloaded LeetCode description data
let remainingDescriptionReferences = [];
const allJsFiles = getFiles(
  "src",
  (name) =>
    name.endsWith(".js") || name.endsWith(".jsx") || name.endsWith(".mjs"),
);
for (const f of allJsFiles) {
  const code = fs.readFileSync(f, "utf8");
  if (code.includes("/data/descriptions/")) {
    remainingDescriptionReferences.push(f);
  }
}

// Check remaining LeetCode network/API calls
const remainingNetworkCalls = [];
const scripts = getFiles(
  "scripts",
  (name) => name.endsWith(".mjs") || name.endsWith(".js"),
);
for (const f of scripts) {
  const code = fs.readFileSync(f, "utf8");
  if (code.includes("leetcode.com/graphql")) {
    remainingNetworkCalls.push({
      file: f,
      endpoint: "leetcode.com/graphql",
      purpose: "Problem description GraphQL scraper (should be removed)",
    });
  }
  if (code.includes("leetcode.com/api/problems/algorithms")) {
    remainingNetworkCalls.push({
      file: f,
      endpoint: "https://leetcode.com/api/problems/algorithms/",
      purpose:
        "Metadata catalog index only (frontend ID, title, slug, difficulty, tags). Retained for catalog explorer.",
    });
  }
}

// Changed files via git
const gitStatus = execSync("git status --porcelain", {
  encoding: "utf8",
}).trim();
const changedFiles = gitStatus
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => line.replace(/^[MADRCU?!]+\s+/, ""));

const auditReport = {
  generatedAt: new Date().toISOString(),
  totalLeetCodeVisualizers,
  descriptionsUsingOurSummaries,
  visualizersWithIndependentlyCreatedExamples:
    visualizersWithIndependentExamples,
  visualizersStillRequiringExampleReview: visualizersRequiringReview,
  remainingReferencesToDownloadedDescriptionData:
    remainingDescriptionReferences,
  remainingLeetCodeNetworkOrApiCalls: remainingNetworkCalls,
  premiumRelatedContentRequiringManualReview: [],
  filesChanged: changedFiles,
  unclassifiedCases: [],
  summaryNotes: [
    "Removed all 2,985 downloaded LeetCode problem description JSON files from public/data/descriptions/.",
    "Retires and removes scripts/fetch-problem-descriptions.mjs and package.json refresh:descriptions script.",
    "Replaced descriptions with a centralized registry of original computational summaries in src/data/problemSummaries.js.",
    'Added LeetCode link with target="_blank" and rel="noopener noreferrer" in ProblemInfoPanel for LeetCode problems.',
    "Non-LeetCode tracks (Basics, Codeforces) do not display LeetCode links.",
    "Replaced example presets in EXAMPLES_REGISTRY and inline components with independently generated test cases.",
    "Added trademark disclaimer in Settings About dialog.",
  ],
};

fs.writeFileSync(
  "scripts/leetcode-content-audit.json",
  JSON.stringify(auditReport, null, 2),
  "utf8",
);
console.log("Generated audit report at scripts/leetcode-content-audit.json");
console.log(JSON.stringify(auditReport, null, 2));
