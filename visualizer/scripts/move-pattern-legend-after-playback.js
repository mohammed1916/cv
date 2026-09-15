import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { parse } from '@babel/parser';

// Dry run by default. Only swap adjacent JSX siblings; preserve their source
// verbatim so attributes, handlers, comments, BOMs, and line endings survive.
const root = fileURLToPath(new URL('../src/problems/', import.meta.url));
const write = process.argv.includes('--write');
if (process.argv.slice(2).some(arg => !['--write', '--check'].includes(arg))) {
  throw new Error('Usage: node scripts/move-pattern-legend-after-playback.js [--write | --check]');
}
if (write && process.argv.includes('--check')) throw new Error('Choose --write or --check, not both.');
const parseJSX = source => parse(source, { sourceType: 'module', plugins: ['jsx'] });
const elementIs = (node, name) => node?.type === 'JSXElement'
  && node.openingElement.name.type === 'JSXIdentifier' && node.openingElement.name.name === name;
function legendIs(node) {
  const expression = node?.type === 'JSXExpressionContainer' && node.expression;
  return expression?.type === 'LogicalExpression' && expression.operator === '&&'
    && expression.left.type === 'Identifier' && expression.left.name === 'showPatternOverlay'
    && elementIs(expression.right, 'PatternLegend');
}
function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  if (typeof node.type === 'string') visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (['loc', 'tokens', 'comments'].includes(key)) continue;
    if (Array.isArray(value)) value.forEach(child => walk(child, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? files(full) : entry.isFile() && full.endsWith('.jsx') ? [full] : [];
  }).sort();
}
const plans = [];
const skipped = [];
const parseErrors = [];
const allFiles = files(root);
let alreadyOrdered = 0;
for (const file of allFiles) {
  const original = fs.readFileSync(file, 'utf8');
  const edits = [];
  let tree;
  try { tree = parseJSX(original); }
  catch (error) {
    parseErrors.push(`${path.relative(root, file)}: ${error.message}`);
    continue;
  }
  walk(tree, node => {
    if (!['JSXElement', 'JSXFragment'].includes(node.type)) return;
    const children = node.children.filter(child => !(child.type === 'JSXText' && !child.value.trim()));
    children.forEach((child, index) => {
      if (!legendIs(child)) return;
      const next = children[index + 1];
      if (!elementIs(next, 'PlaybackControls')) {
        if (elementIs(children[index - 1], 'PlaybackControls')) alreadyOrdered++;
        else skipped.push(`${path.relative(root, file)}:${child.loc.start.line}`);
        return;
      }
      edits.push({ start: child.start, end: next.end,
        text: original.slice(next.start, next.end) + original.slice(child.end, next.start) + original.slice(child.start, child.end) });
    });
  });
  if (!edits.length) continue;
  edits.sort((a, b) => b.start - a.start);
  let updated = original;
  let boundary = original.length;
  for (const edit of edits) {
    if (edit.end > boundary) throw new Error(`Overlapping edits in ${file}`);
    updated = updated.slice(0, edit.start) + edit.text + updated.slice(edit.end);
    boundary = edit.start;
  }
  parseJSX(updated); // Validate all planned files before writing any of them.
  plans.push({ file, updated, count: edits.length });
}
for (const plan of plans) {
  if (write) fs.writeFileSync(plan.file, plan.updated, 'utf8');
  console.log(`${write ? 'Updated' : 'Would update'} ${path.relative(root, plan.file)} (${plan.count})`);
}
console.log(`Scanned ${allFiles.length} JSX files; ${plans.length} ${write ? 'changed' : 'would change'}; ${alreadyOrdered} already ordered; ${skipped.length} non-adjacent legends skipped.`);
for (const item of skipped) console.log(`Review manually: ${item}`);
for (const item of parseErrors) console.log(`Skipped unparseable source: ${item}`);
if (process.argv.includes('--check') && plans.length) process.exitCode = 1;
