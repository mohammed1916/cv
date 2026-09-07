import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Use the CSS parser shipped with the project's existing Vite installation.
const postcss = createRequire(import.meta.resolve('vite'))('postcss');
const root = fileURLToPath(new URL('../', import.meta.url));
const sourceRoot = path.join(root, 'src');
const files = readdirSync(sourceRoot, { recursive: true }).filter(file => file.endsWith('.css')).sort();
const patterns = new Map();
let sourceBytes = 0;
let ruleCount = 0;
for (const file of files) {
  const source = readFileSync(path.join(sourceRoot, file), 'utf8');
  sourceBytes += Buffer.byteLength(source);
  postcss.parse(source, { from: file }).walkRules(rule => {
    ruleCount++;
    // Declaration order matters for fallbacks and shorthand/longhand overrides.
    const declarations = rule.nodes.filter(node => node.type === 'decl')
      .map(node => `${node.prop}:${node.value}${node.important ? '!important' : ''}`).join(';');
    if (declarations.length < 80) return;
    const ancestors = [];
    for (let parent = rule.parent; parent && parent.type !== 'root'; parent = parent.parent) {
      if (parent.type === 'atrule') ancestors.unshift(`@${parent.name} ${parent.params}`);
      else ancestors.unshift(parent.selector || parent.type);
    }
    const context = ancestors.join(' > ');
    const key = JSON.stringify([context, declarations]);
    if (!patterns.has(key)) patterns.set(key, { context, declarations, occurrences: [] });
    patterns.get(key).occurrences.push({ file: `src/${file.replaceAll('\\', '/')}`, line: rule.source.start.line, selector: rule.selector });
  });
}
const repeated = [...patterns.values()]
  .filter(pattern => new Set(pattern.occurrences.map(item => item.file)).size >= 3)
  .sort((a, b) => b.declarations.length * (b.occurrences.length - 1) - a.declarations.length * (a.occurrences.length - 1));
const report = { files: files.length, sourceBytes, ruleCount, repeatedPatterns: repeated.length, candidates: repeated.slice(0, 15) };
if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`${report.files} CSS files; ${sourceBytes.toLocaleString()} source bytes; ${ruleCount.toLocaleString()} rules.`);
  console.log(`${repeated.length} declaration patterns appear in at least three files (same enclosing CSS context).`);
  console.log('Candidates require cascade and visual review; these are not guaranteed byte savings.');
  for (const candidate of report.candidates) {
    console.log(`\n${candidate.occurrences.length} occurrences: ${candidate.declarations}`);
    for (const item of candidate.occurrences.slice(0, 3)) console.log(`  ${item.file}:${item.line} ${item.selector}`);
  }
}
