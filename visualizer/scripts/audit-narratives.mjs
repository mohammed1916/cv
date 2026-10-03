import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

// Report authored narrative coverage, not just the existence of an empty file.
const root = resolve('src/problems');
const covered = [], missing = [], empty = [], unwired = [];
for (const name of readdirSync(root).filter(name => /^Problem\d+$/.test(name))) {
  const folder = resolve(root, name);
  if (!statSync(folder).isDirectory()) continue;
  const files = readdirSync(folder);
  const source = files.filter(file => file.endsWith('.jsx')).map(file => readFileSync(resolve(folder, file), 'utf8')).join('\n');
  for (const file of files.filter(file => /Narrative\.js$/i.test(file))) {
    if (!readFileSync(resolve(folder, file), 'utf8').trim()) empty.push(`${name}/${file}`);
  }
  const shared = source.includes('AlgorithmStoryWorkspace');
  const connected = /narrative:\s*\w/.test(source) || /<AlgorithmNarrative\b/.test(source)
    || /<(?:NextPointersWorkspace|PascalWorkspace)\b/.test(source);
  if (shared && !connected) unwired.push(name);
  (connected ? covered : missing).push(Number(name.slice(7)));
}
covered.sort((a,b) => a-b);
missing.sort((a,b) => a-b);
console.log(JSON.stringify({
  problemFolders: covered.length + missing.length,
  authoredNarratives: covered.length,
  covered, missing, emptyNarrativeFiles: empty, unwiredSharedWorkspaces: unwired,
}, null, 2));
if (empty.length || unwired.length) process.exitCode = 1;
