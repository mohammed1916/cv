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
    const lines = content.split("\n");
    const matchedLines = [];
    lines.forEach((line, index) => {
      // ignore checkboxes and speed controls
      if (
        (/<input\b/i.test(line) &&
          !line.includes('type="checkbox"') &&
          !line.includes('type="range"') &&
          !line.includes("speed")) ||
        /<textarea\b/i.test(line)
      ) {
        matchedLines.push({ lineNum: index + 1, text: line.trim() });
      }
    });
    if (matchedLines.length > 0) {
      report.push({ filePath, matchedLines });
    }
  }
});

console.log(JSON.stringify(report, null, 2));
