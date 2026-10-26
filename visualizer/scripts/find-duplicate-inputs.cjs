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
const problemFiles = [];

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  if (content.includes("<ManualInputPanel")) {
    // Check if there are other input/textarea elements or custom input sections
    const lines = content.split("\n");
    let hasInput = false;
    let inManualInputPanel = false;

    lines.forEach((line, index) => {
      if (line.includes("<ManualInputPanel")) inManualInputPanel = true;
      if (inManualInputPanel && line.includes("/>")) inManualInputPanel = false;

      if (!inManualInputPanel) {
        if (
          /<input\b/i.test(line) &&
          !line.includes('type="checkbox"') &&
          !line.includes('type="range"') &&
          !line.includes("speed")
        ) {
          hasInput = true;
          console.log(`[INPUT] ${filePath}:${index + 1}: ${line.trim()}`);
        }
        if (/<textarea\b/i.test(line)) {
          hasInput = true;
          console.log(`[TEXTAREA] ${filePath}:${index + 1}: ${line.trim()}`);
        }
      }
    });

    if (hasInput) {
      problemFiles.push(filePath);
    }
  }
});

console.log(`\nTotal files with duplicate inputs: ${problemFiles.length}`);
