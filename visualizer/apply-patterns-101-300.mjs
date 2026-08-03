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

function addImports(code) {
  let modified = code;
  const lastImportMatch = modified.match(/^import\s+.*\n/m);
  if (!lastImportMatch) return modified;

  const lastImportIdx = modified.lastIndexOf('import ');
  const endOfLastImport = modified.indexOf('\n', lastImportIdx) + 1;

  if (!modified.includes('CodePatternAnnotations')) {
    modified = modified.slice(0, endOfLastImport) + 
               "import CodePatternAnnotations from '../../components/CodePatternAnnotations'\n" + 
               modified.slice(endOfLastImport);
  }

  if (!modified.includes('PatternLegend')) {
    const newLastImportIdx = modified.lastIndexOf('import ');
    const newEndOfLastImport = modified.indexOf('\n', newLastImportIdx) + 1;
    modified = modified.slice(0, newEndOfLastImport) + 
               "import PatternLegend from '../../components/PatternLegend'\n" + 
               modified.slice(newEndOfLastImport);
  }

  return modified;
}

function addPatternConstants(code, phases, lineMap) {
  let modified = code;

  if (!modified.includes('const PATTERNS')) {
    const patternsConst = `const PATTERNS = [${phases.map(p => `'${p}'`).join(', ')}]\n\n`;
    
    // Find first const or function declaration after imports
    const firstConstMatch = modified.match(/^(const|function|export)/m);
    if (firstConstMatch && firstConstMatch.index) {
      modified = modified.slice(0, firstConstMatch.index) + 
                patternsConst + 
                modified.slice(firstConstMatch.index);
    }
  }

  if (!modified.includes('const LINE_PATTERN_MAP') && Object.keys(lineMap).length > 0) {
    const sortedLines = Object.entries(lineMap).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    const mapEntries = sortedLines.map(([line, phase]) => `  ${line}: '${phase}'`).join(',\n');
    const lineMapConst = `const LINE_PATTERN_MAP = {\n${mapEntries}\n}\n\n`;

    // Insert after PATTERNS const
    const patternsIndex = modified.indexOf('const PATTERNS');
    if (patternsIndex !== -1) {
      const endOfPatternsLine = modified.indexOf('\n', patternsIndex) + 1;
      modified = modified.slice(0, endOfPatternsLine) + 
                lineMapConst + 
                modified.slice(endOfPatternsLine);
    }
  }

  return modified;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    // Skip if already has CodePatternAnnotations
    if (content.includes('CodePatternAnnotations')) {
      return { skip: true, reason: 'Already has CodePatternAnnotations' };
    }

    const phases = extractPhasesFromCode(content);
    if (!phases || phases.length === 0) {
      return { error: 'No phases found' };
    }

    const lineMap = extractLinePatternMap(content);
    if (!Object.keys(lineMap).length) {
      return { error: 'No line mappings found' };
    }

    let modified = content;
    modified = addImports(modified);
    modified = addPatternConstants(modified, phases, lineMap);

    if (modified !== original) {
      fs.writeFileSync(filePath, modified, 'utf-8');
      return {
        success: true,
        phases,
        lineCount: Object.keys(lineMap).length
      };
    }

    return { error: 'No changes made' };
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
console.log('Processing Problems 101-300 visualizers...\n');

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
    console.log(`[${idx + 1}/${targetFiles.length}] ✓ Problem ${problemNum}: ${phaseStr}`);
    results.push({ problem: problemNum, phases: result.phases, lineCount: result.lineCount });
  } else if (result.skip) {
    skipped++;
  } else {
    error++;
    console.log(`[${idx + 1}/${targetFiles.length}] ✗ Problem ${problemNum}: ${result.error}`);
    errors_list.push({ problem: problemNum, error: result.error });
  }
});

console.log('\n' + '='.repeat(60));
console.log(`Successfully processed: ${success}/${targetFiles.length}`);
console.log(`Skipped (already processed): ${skipped}`);
console.log(`Errors/No mappings: ${error}`);
console.log('='.repeat(60));

if (results.length > 0 || errors_list.length > 0) {
  const summaryFile = path.join('/c/Users/BBBS-AI-01/AppData/Local/Temp/claude/c--Users-BBBS-AI-01-d-cv-visualizer/190cb265-8795-4af9-9bac-1997f5d77b46/scratchpad', 'processing_results_101_300.json');
  fs.writeFileSync(summaryFile, JSON.stringify({ 
    processed: success, 
    skipped, 
    errors: error,
    results: results.slice(0, 10),  // Only save first 10 results to keep file size down
    total_results: results.length,
    errors_list: errors_list.slice(0, 10)
  }, null, 2));
  console.log(`\nResults saved to processing_results_101_300.json`);
}
