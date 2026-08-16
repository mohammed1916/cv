import fs from 'fs';
import { execSync } from 'child_process';

function extractPhasesFromCode(code) {
  const phases = new Set();
  const matches = code.match(/phase:\s*['"`]([^'"`]+)['"`]/g) || [];
  matches.forEach(match => {
    const phase = match.match(/['"`]([^'"`]+)['"`]/)[1];
    phases.add(phase);
  });
  return Array.from(phases).sort();
}

function extractLinePatternMap(code) {
  const map = {};
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('activeLine:')) {
      const lineMatch = line.match(/activeLine:\s*(\d+)/);
      if (lineMatch) {
        const lineNum = lineMatch[1];
        let phaseFound = null;
        for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 4); j++) {
          const phaseMatch = lines[j].match(/phase:\s*['"`]([^'"`]+)['"`]/);
          if (phaseMatch) {
            phaseFound = phaseMatch[1];
            break;
          }
        }
        if (phaseFound && !map[lineNum]) {
          map[lineNum] = phaseFound;
        }
      }
    }
  }
  return map;
}

function fillPatternConstants(code, phases, lineMap) {
  let modified = code;
  if (modified.includes("const PATTERNS = []")) {
    const patternsStr = `const PATTERNS = [${phases.map(p => `'${p}'`).join(', ')}]`;
    modified = modified.replace(/const PATTERNS = \[\]/, patternsStr);
  }
  if (modified.includes("const LINE_PATTERN_MAP = {}")) {
    if (Object.keys(lineMap).length > 0) {
      const sortedLines = Object.entries(lineMap).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
      const mapEntries = sortedLines.map(([line, phase]) => `  ${line}: '${phase}'`).join(',\n');
      const lineMapStr = `const LINE_PATTERN_MAP = {\n${mapEntries}\n}`;
      modified = modified.replace(/const LINE_PATTERN_MAP = {}/, lineMapStr);
    }
  }
  return modified;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const original = content;
    if (!content.includes("const PATTERNS = []") && !content.includes("const LINE_PATTERN_MAP = {}")) {
      return { skip: true };
    }
    const phases = extractPhasesFromCode(content);
    if (!phases || phases.length === 0) {
      return { error: 'No phases' };
    }
    const lineMap = extractLinePatternMap(content);
    let modified = fillPatternConstants(content, phases, lineMap);
    if (modified !== original) {
      fs.writeFileSync(filePath, modified, 'utf-8');
      return { success: true, phases, lineCount: Object.keys(lineMap).length };
    }
    return { error: 'No changes' };
  } catch (err) {
    return { error: err.message };
  }
}

console.log('Filling PATTERNS and LINE_PATTERN_MAP for Problems 101-300...\n');
try {
  const output = execSync(`find /c/Users/BBBS-AI-01/d/cv/visualizer/src/problems -name "*Visualizer.jsx" | grep -E "Problem(10[1-9]|1[1-9][0-9]|2[0-9]{2}|300)" | sort -V`, { encoding: 'utf-8' });
  let files = output.trim().split('\n').filter(f => f.length > 0);
  files = files.map(f => f.replace(/^\/c\//, 'C:').replace(/\//g, String.fromCharCode(92)));
  console.log(`Found ${files.length} visualizers\n`);

  let success = 0, skipped = 0, error = 0;
  const results = [];
  files.forEach((filePath, idx) => {
    const problemNum = (filePath.match(/Problem(\d+)/) || [,'-'])[1];
    const result = processFile(filePath);
    if (result.success) {
      success++;
      const phaseStr = result.phases.length > 3 ? result.phases.slice(0, 3).join(', ') + '...' : result.phases.join(', ');
      if (idx < 10 || idx % 20 === 0) console.log(`[${idx + 1}/${files.length}] ✓ P${problemNum}: ${phaseStr}`);
      results.push({ problem: problemNum, phases: result.phases });
    } else if (result.skip) {
      skipped++;
    } else {
      error++;
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Filled: ${success}/${files.length} | Already filled: ${skipped} | Errors: ${error}`);
  console.log(`${'='.repeat(60)}`);
  if (results.length > 0) {
    console.log(`\nFirst 5 results:`);
    results.slice(0, 5).forEach(r => console.log(`  Problem ${r.problem}: [${r.phases.slice(0, 3).join(', ')}...]`));
  }
} catch (err) {
  console.error('Error:', err.message);
}
