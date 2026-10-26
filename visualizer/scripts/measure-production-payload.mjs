import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const manifestPath = path.join(distDir, ".vite", "manifest.json");

if (!fs.existsSync(manifestPath)) {
  console.error(
    `Manifest not found at: ${manifestPath}\nPlease run "npm.cmd run build -- --manifest" first.`,
  );
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

// Get git revision safely
let gitRevision = "unknown";
try {
  gitRevision = execSync("git rev-parse HEAD", {
    cwd: root,
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim();
} catch {}

// Helper to compute size, gzip and brotli with strict missing-file failure
function getFileSizes(relPath) {
  const fullPath = path.join(distDir, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(
      `Asset referenced in manifest does not exist in dist: ${relPath}`,
    );
  }
  const buf = fs.readFileSync(fullPath);
  return {
    raw: buf.length,
    gzip: zlib.gzipSync(buf, { level: 9 }).length,
    brotli: zlib.brotliCompressSync(buf).length,
  };
}

// Find entry chunk (e.g. index.html)
let appEntryKey = Object.keys(manifest).find((k) => manifest[k].isEntry);
if (!appEntryKey) {
  appEntryKey = "index.html";
}

function resolveStaticDependencies(chunkKey, visitedChunks = new Set()) {
  if (!chunkKey || visitedChunks.has(chunkKey) || !manifest[chunkKey]) {
    return { jsFiles: new Set(), cssFiles: new Set() };
  }
  visitedChunks.add(chunkKey);

  const jsFiles = new Set();
  const cssFiles = new Set();

  const item = manifest[chunkKey];
  if (item.file && item.file.endsWith(".js")) {
    jsFiles.add(item.file);
  }
  if (item.css) {
    for (const c of item.css) cssFiles.add(c);
  }

  if (item.imports) {
    for (const imp of item.imports) {
      const sub = resolveStaticDependencies(imp, visitedChunks);
      for (const f of sub.jsFiles) jsFiles.add(f);
      for (const f of sub.cssFiles) cssFiles.add(f);
    }
  }

  return { jsFiles, cssFiles };
}

function measureAssetSet(files) {
  let totalRaw = 0;
  let totalGzip = 0;
  let totalBrotli = 0;
  const assetDetails = [];

  for (const f of [...files].sort()) {
    const sizes = getFileSizes(f);
    totalRaw += sizes.raw;
    totalGzip += sizes.gzip;
    totalBrotli += sizes.brotli;
    assetDetails.push({ file: f, ...sizes });
  }

  return {
    count: files.size,
    raw: totalRaw,
    gzip: totalGzip,
    brotli: totalBrotli,
    assets: assetDetails,
  };
}

// Resolve App Entry
const appDeps = resolveStaticDependencies(appEntryKey);
const appAssets = new Set([...appDeps.jsFiles, ...appDeps.cssFiles]);
const appSummary = measureAssetSet(appAssets);

// Helper to find chunk key for a problem
function findProblemKey(problemNum) {
  const target = `src/problems/Problem${problemNum}/index.jsx`;
  return Object.keys(manifest).find(
    (k) => k === target || manifest[k].src === target,
  );
}

function measureScenario(name, problemNums = []) {
  const scenarioAssets = new Set(appAssets);
  for (const num of problemNums) {
    const pKey = findProblemKey(num);
    if (!pKey) {
      throw new Error(
        `Problem ${num} entry (src/problems/Problem${problemNum}/index.jsx) not found in manifest.`,
      );
    }
    const pDeps = resolveStaticDependencies(pKey, new Set());
    for (const f of pDeps.jsFiles) scenarioAssets.add(f);
    for (const f of pDeps.cssFiles) scenarioAssets.add(f);
  }

  const result = measureAssetSet(scenarioAssets);
  return {
    scenario: name,
    assetCount: result.count,
    raw: result.raw,
    gzip: result.gzip,
    brotli: result.brotli,
    uniqueAssets: [...scenarioAssets].sort(),
  };
}

// Scenarios:
// 1. App entry alone
// 2. Cold 120, 121, 125, 132, 141, 142
// 3. Warm 125 -> 132 (assets loaded after 125 already cached)
const baseApp = {
  scenario: "App entry dependencies",
  assetCount: appSummary.count,
  raw: appSummary.raw,
  gzip: appSummary.gzip,
  brotli: appSummary.brotli,
  uniqueAssets: [...appAssets].sort(),
};

const cold120 = measureScenario("App + first visit to 120", [120]);
const cold121 = measureScenario("App + first visit to 121", [121]);
const cold125 = measureScenario("App + first visit to 125", [125]);
const cold132 = measureScenario("App + first visit to 132", [132]);
const cold141 = measureScenario("App + first visit to 141", [141]);
const cold142 = measureScenario("App + first visit to 142", [142]);

// Warm 125 -> 132: assets in cold132 that are NOT in cold125
const assets125 = new Set(cold125.uniqueAssets);
const warm132Assets = new Set(
  cold132.uniqueAssets.filter((f) => !assets125.has(f)),
);
const warm132Result = measureAssetSet(warm132Assets);

const warmDelta125to132 = {
  scenario: "Additional assets for 132 after visiting 125",
  assetCount: warm132Result.count,
  raw: warm132Result.raw,
  gzip: warm132Result.gzip,
  brotli: warm132Result.brotli,
  uniqueAssets: [...warm132Assets].sort(),
};

const report = {
  metadata: {
    gitRevision,
    nodeVersion: process.version,
    buildMode: "production",
    compression: {
      gzip: "zlib.gzipSync level 9",
      brotli: "zlib.brotliCompressSync default (quality 11)",
    },
    generatedAt: new Date().toISOString(),
    manifestPath: path.relative(root, manifestPath).replaceAll("\\", "/"),
  },
  scenarios: [
    baseApp,
    cold120,
    cold121,
    cold125,
    cold132,
    cold141,
    cold142,
    warmDelta125to132,
  ],
};

const outPath = path.join(root, "docs", "production-payload-report.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("=== Production Manifest Payload Report ===");
  console.log(`Git Revision: ${gitRevision} | Node: ${process.version}`);
  console.table(
    report.scenarios.map((s) => ({
      Scenario: s.scenario,
      Files: s.assetCount,
      "Raw (B)": s.raw.toLocaleString(),
      "Gzip (B)": s.gzip.toLocaleString(),
      "Brotli (B)": s.brotli.toLocaleString(),
    })),
  );
  console.log(`Saved report to docs/production-payload-report.json`);
}
