// Background tokens must not be used as text colors. Check actual CSS/JSX
// foreground roles, including conditional branches and SVG text, rather than
// replacing every occurrence (shapes and backgrounds still need these tokens).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { parseFile, walk } from './ast-scope-utils.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const postcss = createRequire(import.meta.resolve('vite'))('postcss');
const backgroundToken = /var\(\s*--(?:surface[\w-]*|bg|code-bg)\s*[,)]/;
const findings = [];
let checked = 0;
// Unused legacy files with pre-existing syntax errors (a nested template comment
// and input validation). The registered Problem381 implementation is checked.
const legacyParseErrors = new Set([
  'src/Visualizer.jsx',
  'src/problems/Problem381/RandomizedCollection/RandomizedCollectionVisualizer.jsx',
]);
const relative = file => path.relative(root, file).replaceAll('\\', '/');
const jsxName = node => node?.type === 'JSXMemberExpression' ? `${jsxName(node.object)}.${jsxName(node.property)}` : node?.name;
const isText = node => /^(?:motion\.)?(?:text|tspan)$/.test(jsxName(node?.openingElement?.name));

function report(file, line, role, value) {
  if (backgroundToken.test(value)) findings.push(`${relative(file)}:${line}: ${role} uses ${value}`);
}

function checkJs(file, source) {
  const ast = parseFile(source);
  walk(ast, (node, stack) => {
    if (node.type === 'ObjectProperty') {
      const property = node.key.name ?? node.key.value;
      const element = [...stack].reverse().find(parent => parent.type === 'JSXElement');
      if (property === 'color' || (property === 'fill' && isText(element))) {
        walk(node.value, value => {
          if (value.type === 'StringLiteral') report(file, value.loc.start.line, property, value.value);
        });
      }
    }
    if (node.type === 'JSXAttribute' && node.name.name === 'fill') {
      const element = [...stack].reverse().find(parent => parent.type === 'JSXElement');
      if (isText(element)) walk(node.value, value => {
        if (value.type === 'StringLiteral') report(file, value.loc.start.line, 'SVG text fill', value.value);
      });
    }
  });
}

for (const entry of fs.readdirSync(path.join(root, 'src'), { recursive: true }).sort()) {
  if (!/\.(css|jsx?)$/.test(entry)) continue;
  const file = path.join(root, 'src', entry);
  if (legacyParseErrors.has(relative(file))) continue;
  const source = fs.readFileSync(file, 'utf8');
  try {
    if (file.endsWith('.css')) {
      postcss.parse(source, { from: file }).walkDecls('color', declaration => {
        report(file, declaration.source.start.line, 'CSS color', declaration.value);
      });
    } else checkJs(file, source);
    checked++;
  } catch (error) {
    findings.push(`${relative(file)}: cannot audit: ${error.message}`);
  }
}

if (findings.length) {
  console.error(findings.join('\n'));
  console.error(`FAIL: ${findings.length} foreground-role or parse errors.`);
  process.exitCode = 1;
} else console.log(`PASS: ${checked} source files use text-role tokens for foregrounds.`);
console.log(`Excluded ${legacyParseErrors.size} unused legacy files with known syntax errors.`);
console.log('This checks token roles; rendered contrast and fixed colors require separate browser checks.');
