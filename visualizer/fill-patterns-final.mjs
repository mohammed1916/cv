import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

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

// Find files using bash find command
console.log('Filling in PATTERNS and LINE_PATTERN_MAP for Problems 101-300...\n');

try {
  const output = execSync(`find /c/Users/BBBS-AI-01/d/cv/visualizer/src/problems -name "*Visualizer.jsx" | grep -E "Problem(10[1-9]|1[1-9][0-9]|2[0-9]{2}|300)" | sort -V`, { encoding: 'utf-8' });
  let files = output.trim().split('\n').filter(f => f.length > 0);
  
  // Convert /c/ Unix paths to Windows-style paths for Node.js fs module
  files = files.map(f => {
    return f.replace(/^\/c\//, 'C:\').replace(/\//g, '\');
  });
  
  console.log(`Found ${files.length} visualizers (101-300)\n`);

  let success = 0, skipped = 0, error = 0;
  const results = [];
  const errors_list = [];

  files.forEach((filePath, idx) => {
    const problemMatch = filePath.match(/Problem(\d+)/);
    const problemNum = problemMatch ? problemMatch[1] : 'unknown';
    const result = processFile(filePath);

    if (result.success) {
      success++;
      const phaseStr = result.phases.length > 3 
        ? result.phases.slice(0, 3).join(', ') + '...'
        : result.phases.join(', ');
      console.log(`[${idx + 1}/${files.length}] ✓ Problem ${problemNum}: ${phaseStr} (${result.lineCount} lines)`);
      results.push({ problem: problemNum, phases: result.phases, lineCount: result.lineCount });
    } else if (result.skip) {
      skipped++;
    } else {
      error++;
      if (error <= 20) {
        console.log(`[${idx + 1}/${files.length}] ✗ Problem ${problemNum}: ${result.error}`);
      }
      errors_list.push({ problem: problemNum, error: result.error });
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Successfully filled: ${success}/${files.length}`);
  console.log(`Already filled: ${skipped}`);
  console.log(`Errors/No mappings: ${error}`);
  console.log('='.repeat(60));

  if (results.length > 0) {
    console.log(`\nSample results (first 10):`);
    results.slice(0, 10).forEach(r => {
      console.log(`  Problem ${r.problem}: [${r.phases.join(', ')}]`);
    });
  }
} catch (err) {
  console.error('Error:', err.message);
}
