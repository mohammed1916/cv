import { normalizePythonInputForEntry } from "./runtime/inferPythonInput.js";
export const PLAYGROUND_KEYS = {
  source: 'cpviz.runtime-playground.source.v1',
  pythonSource: 'cpviz.runtime-playground.python-source.v1',
  input: 'cpviz.runtime-playground.python-input.v1',
  entry: 'cpviz.runtime-playground.python-entry.v1',
  bindings: 'cpviz.runtime-playground.python-bindings.v2',
  mode: 'cpviz.runtime-playground.mode.v1',
};
const PREFIX = 'cpviz.problem-workspace.';
export function workspaceKeys(id = '') {
  return Object.fromEntries(Object.entries(PLAYGROUND_KEYS).map(([name, key]) => [name, id ? `${PREFIX}${id}.${name}` : key]));
}
export function readProblemWorkspace(storage, search) {
  const id = new URLSearchParams(search).get('workspace');
  if (!id || !/^[a-zA-Z0-9-]{1,80}$/.test(id)) return null;
  try {
    const value = JSON.parse(storage.getItem(`${PREFIX}${id}.metadata`));
    return typeof value?.slug === 'string' && /^[a-zA-Z0-9-]+$/.test(value.slug) && typeof value.source === 'string' ? { ...value, id } : null;
  } catch { return null; }
}
export function createProblemWorkspace(storage, { source, input, slug = "climbing-stairs", title = "Climbing Stairs", entry }, id) {
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(id)) throw new Error('Invalid workspace ID.');
  if (!source.trim()) throw new Error('No solution code to copy.');
  if (!/^[a-zA-Z0-9-]+$/.test(slug)) throw new Error('Invalid problem slug.');
  if (slug === 'climbing-stairs' && (!Number.isInteger(input?.n) || input.n < 1 || input.n > 45)) throw new Error('Use a Climbing Stairs input from 1 to 45.');
  const keys = workspaceKeys(id);
  const inferred = normalizePythonInputForEntry(source, input ?? {}, entry);
  input = input ?? inferred.value;
  const metadata = { id, slug, title, source, entry: entry ?? (slug === 'climbing-stairs' ? 'Solution.climbStairs' : (inferred.entry && /class\s+Solution\b/.test(source) ? `Solution.${inferred.entry}` : inferred.entry ?? '')) };
  const entries = [[keys.pythonSource, source], [keys.input, JSON.stringify(input, null, 2)], [keys.entry, metadata.entry], [keys.mode, 'python'], [`${PREFIX}${id}.metadata`, JSON.stringify(metadata)]];
  if (entries.some(([key]) => storage.getItem(key) !== null)) throw new Error('Workspace already exists. Try opening again.');
  const written = [];
  try {
    for (const [key, value] of entries) { storage.setItem(key, value); written.push(key); }
  } catch {
    written.forEach(key => storage.removeItem(key));
    throw new Error('Could not save the new workspace. Your existing draft was not changed.');
  }
  return metadata;
}

export function staircaseFromTrace({ source, referenceSource, input, traceFrames, index }) {
  if (source !== referenceSource) return { supported: false, reason: 'This code has changed. General execution visuals are active; the staircase mapping currently supports the imported solution.' };
  const n = input?.n;
  if (!Number.isInteger(n) || n < 1 || n > 45) return { supported: false, reason: 'The staircase preview supports integer n from 1 to 45.' };
  const frame = traceFrames?.[index];
  if (!frame) return { supported: false, reason: 'Run the code and select a trace frame to see the staircase.' };
  const dp = [];
  let current = 1;
  for (const snapshot of traceFrames.slice(0, index + 1)) {
    if (snapshot.function !== 'climbStairs') continue;
    const locals = snapshot.locals || {};
    if (Number.isInteger(locals.one) && Number.isInteger(locals.two)) { dp[0] = 1; dp[1] = 1; }
    if (Number.isInteger(locals.i) && locals.i >= 0 && locals.i < n - 1) {
      current = locals.i + 2;
      if (snapshot.line >= 7 && Number.isInteger(locals.one)) dp[current] = locals.one;
    }
  }
  return { supported: true, n, current, dp };
}
