import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const manifest = JSON.parse(fs.readFileSync('dist/.vite/manifest.json', 'utf8'));
const report = JSON.parse(fs.readFileSync('dist/.vite/bundle-report.json', 'utf8'));
const closure = (key, seen = new Set()) => {
  if (seen.has(key)) return seen;
  assert.ok(manifest[key], `Missing manifest entry ${key}`);
  seen.add(key);
  for (const dependency of manifest[key].imports ?? []) closure(dependency, seen);
  return seen;
};
const filesFor = key => [...new Set([...closure(key)].map(k => manifest[k].file))];
const modulesFor = key => filesFor(key).flatMap(file => Object.keys(report[file]?.modules ?? {}));
const size = file => fs.statSync(path.join('dist', file)).size;
const completed = new Set();
function checkDependencies(key, visiting = new Set()) {
  assert.ok(manifest[key], `Missing manifest dependency ${key}`);
  assert.ok(!visiting.has(key), `Circular static chunk dependency at ${key}`);
  if (completed.has(key)) return;
  assert.ok(fs.existsSync(path.join('dist', manifest[key].file)), `Missing output ${manifest[key].file}`);
  visiting.add(key);
  for (const dependency of manifest[key].imports ?? []) checkDependencies(dependency, visiting);
  visiting.delete(key);
  completed.add(key);
}
Object.keys(manifest).forEach(key => checkDependencies(key));
const forbidden = /src\/(?:config\/(?:authoredExamples|examplesRegistry|collectionStoryExamples)\.js|problems\/families\/collectionStories\/(?:definitions|definitionSources|authoredBatches|specs|algorithms)\.js)$/;
for (const [file, chunk] of Object.entries(report)) {
  assert.ok(size(file) <= 500000, `${file}: ${size(file)} bytes exceeds 500 kB`);
  for (const module of Object.keys(chunk.modules)) assert.ok(!forbidden.test(module), `${file} includes tooling aggregate ${module}`);
}
const startupModules = modulesFor('index.html');
assert.ok(!startupModules.some(id => id.startsWith('src/config/examples/')), 'Startup must not load problem examples');
for (const problem of [1, 1405, 2244]) {
  const key = `src/problems/Problem${problem}/index.jsx`;
  const modules = modulesFor(key);
  const groups = modules.filter(id => id.includes('/collectionStories/definitionGroups/'));
  if (problem !== 1) assert.equal(groups.length, 1, `Problem ${problem} loads only its definition group`);
  assert.ok(!modules.some(id => id.endsWith(`/examples/collection--${problem === 2244 ? 1405 : 2244}.js`)), `Problem ${problem} includes an unrelated collection's examples`);
}
// Firebase ignores the hidden .vite reports; development documents must not be public files.
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? (entry.name.startsWith('.') ? [] : walk(path.join(dir, entry.name))) : [path.join(dir, entry.name)]);
assert.ok(!walk('dist').some(file => /\.md$/i.test(file)), 'Development Markdown must stay out of dist');
const entryFiles = filesFor('index.html').filter(file => file.endsWith('.js'));
const largest = Object.keys(report).sort((a, b) => size(b) - size(a))[0];
console.log(JSON.stringify({
  chunks: Object.keys(report).length,
  largest: { file: largest, bytes: size(largest) },
  startup: {
    bytes: entryFiles.reduce((total, file) => total + size(file), 0),
    gzip: entryFiles.reduce((total, file) => total + gzipSync(fs.readFileSync(path.join('dist', file))).length, 0),
  },
  checkedRoutes: [1, 1405, 2244],
}, null, 2));
