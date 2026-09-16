import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from '@babel/parser';

const root = fileURLToPath(new URL('../', import.meta.url));
const problems = path.join(root, 'src/problems');
const relative = file => path.relative(root, file).replaceAll('\\', '/');
const cache = new Map();
function inspect(file) {
  if (cache.has(file)) return cache.get(file);
  const source = fs.readFileSync(file, 'utf8');
  const result = { source, dependencies: [], parseError: null };
  cache.set(file, result);
  if (file.endsWith('.css')) return result;
  try {
    const tree = parse(source, { sourceType: 'module', plugins: ['jsx'] });
    const sources = tree.program.body.filter(node => ['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration'].includes(node.type))
      .map(node => node.source?.value).filter(value => value?.startsWith('.'));
    for (const source of sources) {
      const base = path.resolve(path.dirname(file), source);
      const resolved = [base, `${base}.js`, `${base}.jsx`, path.join(base, 'index.js'), path.join(base, 'index.jsx')]
        .find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      if (resolved && /\.(jsx?|css)$/.test(resolved)) result.dependencies.push(resolved);
    }
  } catch (error) { result.parseError = error.message; }
  return result;
}
function collect(file, visited = new Set()) {
  if (visited.has(file)) return visited;
  visited.add(file);
  for (const dependency of inspect(file).dependencies) collect(dependency, visited);
  return visited;
}
const entries = [];
for (const entry of fs.readdirSync(problems, { withFileTypes: true }).filter(entry => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
  const directory = path.join(problems, entry.name);
  const metaFile = path.join(directory, 'meta.js');
  const index = path.join(directory, 'index.jsx');
  if (!fs.existsSync(metaFile) || !fs.existsSync(index)) continue;
  const { meta } = await import(pathToFileURL(metaFile));
  if (!meta?.number || !meta?.title) continue;
  const reachable = [...collect(index)];
  const ownFiles = reachable.filter(file => file.startsWith(`${directory}${path.sep}`));
  const ownSource = ownFiles.filter(file => !file.endsWith('.css')).map(file => inspect(file).source).join('\n');
  const source = reachable.filter(file => !file.endsWith('.css')).map(file => inspect(file).source).join('\n');
  entries.push({ number: meta.number, title: meta.title, folder: entry.name,
    review: entry.name === 'Problem112' ? 'story-pilot' : 'not-reviewed',
    files: ownFiles.map(relative),
    css: reachable.filter(file => file.endsWith('.css')).map(relative),
    signals: { localSVG: /<svg\b/.test(ownSource), treeView: /TreeCanvas|TreeVisualizer/.test(source),
      sharedWorkspace: /<AlgorithmWorkspace\b/.test(source), playback: /<PlaybackControls\b/.test(source),
      floating: /<FloatingPanel\b/.test(source), lumino: /<LuminoDockPanel\b/.test(source),
      emptyPatternDefinition: /const\s+PATTERNS\s*=\s*\[\s*\]/.test(ownSource) },
    parseErrors: reachable.filter(file => inspect(file).parseError).map(file => ({ file: relative(file), error: inspect(file).parseError })),
  });
}
const cssFiles = fs.readdirSync(path.join(root, 'src'), { recursive: true }).filter(file => file.endsWith('.css'));
const report = {
  note: 'Static import inventory, not a visual-quality certification. Dynamic imports and runtime-selected renderers require manual review. CSS byte counts are source bytes, not transferred bytes.',
  registeredEntries: entries.length,
  cssFiles: cssFiles.length,
  cssSourceBytes: cssFiles.reduce((total, file) => total + fs.statSync(path.join(root, 'src', file)).size, 0),
  entries,
};
fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
fs.writeFileSync(path.join(root, 'docs/visual-story-inventory.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Inventoried ${entries.length} registered entries and ${cssFiles.length} CSS files. See docs/visual-story-inventory.json.`);
