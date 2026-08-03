import fs from 'fs';
import path from 'path';
import { readdirSync } from 'fs';

const PROBLEMS_DIR = '/c/Users/BBBS-AI-01/d/cv/visualizer/src/problems';

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

  // Replace empty PATTERNS
  if (modified.includes("const PATTERNS = []")) {
    const patternsStr = `const PATTERNS = [${phases.map(p => `'${p}'`).join(', ')}]`;
    modified = modified.replace(/const PATTERNS = \[\]/, patternsStr);
  }

  // Replace empty LINE_PATTERN_MAP
  if (modified.includes("const LINE_PATTERN_MAP = {}")) {
    if (Object.keys(lineMap).length > 0) {
      const sortedLines = Object.entries(lineMap).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
      const mapEntries = sortedLines.map(([line, phase]) => `  ${line}: '${phase}'`).join(',\n');
      const lineMapStr = `const LINE_PATTERN_MAP = {\n${mapEntries}\n}`;
      modified = modified.replace(/const LINE_PATTERN_MAP = \{\}/, lineMapStr);
    }
  }

  return modified;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    // Check if it has empty placeholders
    if (!content.includes("const PATTERNS = []") && !content.includes("const LINE_PATTERN_MAP = {}")) {
      return { skip: true, reason: 'Already filled' };
    }

    const phases = extractPhasesFromCode(content);
    if (!phases || phases.length === 0) {
      return { error: 'No phases found' };
    }

    const lineMap = extractLinePatternMap(content);

    let modified = fillPatternConstants(content, phases, lineMap);

    if (modified !== original) {
      fs.writeFileSync(filePath, modified, 'utf-8');
      return {
        success: true,
        phases,
        lineCount: Object.keys(lineMap).length
      };
    }

    return { error: 'No changes needed' };
  } catch (err) {
    return { error: err.message };
  }
}

// Find visualizer files
function findVisualizerFiles() {
  const files = [];
  const problemDirs = readdirSync(PROBLEMS_DIR);
  
  for (const dir of problemDirs) {
    const match = dir.match(/Problem(\d+)/);
    if (!match) continue;
    
    const num = parseInt(match[1]);
    if (num < 101 || num > 300) continue;
    
    const problemDir = path.join(PROBLEMS_DIR, dir);
    try {
      const dirFiles = readdirSync(problemDir);
      const vizFile = dirFiles.find(f => f.includes('Visualizer.jsx'));
      if (vizFile) {
        files.push({
          path: path.join(problemDir, vizFile),
          problem: num
        });
      }
    } catch (e) {
      // skip if not readable
    }
  }
  
  return files.sort((a, b) => a.problem - b.problem);
}

// Main execution
console.log('Filling in PATTERNS and LINE_PATTERN_MAP for Problems 101-300...\n');

const targetFiles = findVisualizerFiles();
console.log(`Found ${targetFiles.length} visualizers (101-300)\n`);

let success = 0, skipped = 0, error = 0;
const results = [];
const errors_list = [];

targetFiles.forEach((fileObj, idx) => {
  const { path: filePath, problem: problemNum } = fileObj;
  const result = processFile(filePath);

  if (result.success) {
    success++;
    const phaseStr = result.phases.length > 3 
      ? result.phases.slice(0, 3).join(', ') + '...'
      : result.phases.join(', ');
    console.log(`[${idx + 1}/${targetFiles.length}] ✓ Problem ${problemNum}: ${phaseStr} (${result.lineCount} lines)`);
    results.push({ problem: problemNum, phases: result.phases, lineCount: result.lineCount });
  } else if (result.skip) {
    skipped++;
  } else {
    error++;
    if (error <= 20) {
      console.log(`[${idx + 1}/${targetFiles.length}] ✗ Problem ${problemNum}: ${result.error}`);
    }
    errors_list.push({ problem: problemNum, error: result.error });
  }
});

console.log('\n' + '='.repeat(60));
console.log(`Successfully filled: ${success}/${targetFiles.length}`);
console.log(`Already filled: ${skipped}`);
console.log(`Errors/No mappings: ${error}`);
console.log('='.repeat(60));

if (results.length > 0) {
  const summaryFile = path.join('/c/Users/BBBS-AI-01/AppData/Local/Temp/claude/c--Users-BBBS-AI-01-d-cv-visualizer/190cb265-8795-4af9-9bac-1997f5d77b46/scratchpad', 'filling_results_101_300.json');
  fs.writeFileSync(summaryFile, JSON.stringify({ 
    filled: success, 
    already_filled: skipped, 
    errors: error,
    sample_results: results.slice(0, 20),
    total_results: results.length
  }, null, 2));
  console.log(`\nResults saved to filling_results_101_300.json`);
}
