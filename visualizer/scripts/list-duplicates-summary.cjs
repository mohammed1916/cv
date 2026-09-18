const fs = require("fs");
const path = require("path");

function findJsxFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findJsxFiles(fullPath));
    } else if (file.endsWith(".jsx")) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = findJsxFiles("src/problems");
const report = [];

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  if (content.includes("<ManualInputPanel")) {
    const tagMatches =
      content.match(/<(input|textarea)\b[\s\S]*?(?:\/>|>[\s\S]*?<\/\1>)/gi) ||
      [];
    const duplicateInputs = tagMatches.filter((tag) => {
      if (tag.includes('type="checkbox"') || tag.includes("type='checkbox'"))
        return false;
      if (tag.includes('type="range"') || tag.includes("type='range'"))
        return false;
      if (tag.includes("speed") || tag.includes("setSpeed")) return false;
      if (tag.includes('type="hidden"') || tag.includes("type='hidden'"))
        return false;
      if (tag.includes("constVal")) return false; // specialized interactive condition in MatrixIterationBasics
      return true;
    });

    if (duplicateInputs.length > 0) {
      report.push({ filePath, duplicateInputs });
    }
  }
});

if (report.length > 0) {
  console.log(
    report
      .map((r) => `${r.filePath} (${r.duplicateInputs.length} matches)`)
      .join("\n"),
  );
} else {
  console.log(
    "No remaining duplicate input elements found across all problem files with ManualInputPanel!",
  );
}
console.log("Total files with duplicates:", report.length);
