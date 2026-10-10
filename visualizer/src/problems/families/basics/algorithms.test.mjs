import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createBasicsDefinition, lessons, parseBasics } from './definitions.js';
import { binarySearchSteps } from '../../../algorithms/shared/binarySearch.js';
import { histogramSteps } from '../../../algorithms/shared/histogram.js';
import { AuthoredMinHeap } from '../collectionStories/authoredMinHeap.js';
import { isFreeProblem } from '../../../access/policy.js';
import { BASICS_PROBLEMS } from '../../../data/basicsCatalog.js';

const refs = {
  pair: ({ nums, target }) => { for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) if (nums[i] + nums[j] === target) return [i, j]; return null; },
  window: ({ nums, k }) => Math.max(...nums.slice(k - 1).map((_, i) => nums.slice(i, i + k).reduce((a, b) => a + b, 0))),
  insertion: ({ nums }) => [...nums].sort((a, b) => a - b),
  greater: ({ nums }) => nums.map((value, i) => nums.slice(i + 1).find(n => n > value) ?? null),
  gcd: ({ a, b }) => { for (let d = Math.max(a, b); d >= 1; d--) if (a % d === 0 && b % d === 0) return d; },
  linear: ({ nums, target }) => nums.indexOf(target),
  lower: ({ nums, target }) => { const i = nums.findIndex(n => n >= target); return i < 0 ? nums.length : i; },
  histogram: ({ heights }) => {
    let best = 0;
    for (let i = 0; i < heights.length; i++) for (let j = i; j < heights.length; j++) best = Math.max(best, Math.min(...heights.slice(i, j + 1)) * (j - i + 1));
    return best;
  },
  heap: ({ operations }) => { const values = [], out = []; for (const op of operations) { if (op[0] === 'push') values.push(op[1]); else { values.sort((a, b) => a - b); out.push(values.shift() ?? null); } } return out; },
  segment: ({ nums, operations }) => { const values = [...nums], out = []; for (const [op, a, b] of operations) { if (op === 'set') values[a] = b; else out.push(values.slice(a, b + 1).reduce((sum, n) => sum + n, 0)); } return out; },
  trie: ({ words, query }) => ({ prefix: words.some(word => word.startsWith(query)), word: words.includes(query) }),
  prefix: ({ nums, queries }) => queries.map(([a, b]) => nums.slice(a, b + 1).reduce((sum, n) => sum + n, 0)),
  bfs: ({ n, edges, start }) => {
    const dist = Array(n).fill(Infinity); dist[start] = 0;
    for (let i = 0; i < n; i++) for (const [a, b] of edges) { dist[a] = Math.min(dist[a], dist[b] + 1); dist[b] = Math.min(dist[b], dist[a] + 1); }
    return dist.map(d => Number.isFinite(d) ? d : null);
  },
};
function check(kind, input) {
  const d = createBasicsDefinition(kind), before = structuredClone(input), run = d.build(d.parse(JSON.stringify(input)));
  assert.deepEqual(input, before, 'Input is not mutated');
  if (kind === 'binary') {
    if (input.nums.includes(input.target)) assert.equal(input.nums[run.result], input.target);
    else assert.equal(run.result, -1);
  } else if (kind === 'pair' && refs.pair(input) !== null) {
    assert.ok(Array.isArray(run.result));
    const [a, b] = run.result;
    assert.ok(a >= 0 && a < b && b < input.nums.length);
    assert.equal(input.nums[a] + input.nums[b], input.target);
  } else assert.deepEqual(run.result, refs[kind](input), `${kind}: ${JSON.stringify(input)}`);
  assert.equal(run.frames[0].phase, 'start');
  assert.equal(run.frames.at(-1).phase, 'done');
  for (const frame of run.frames) {
    assert.ok(frame.message.length > 5);
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= d.code.length, `${kind}: code line ${frame.activeLine}`);
    assert.equal(d.pythonStages[frame.codeStage], frame.activeLine);
  }
  // An earlier snapshot must survive subsequent edits to a later snapshot.
  const first = JSON.stringify(run.frames[0]);
  const last = run.frames.at(-1);
  for (const value of Object.values(last)) if (Array.isArray(value)) value.push('sentinel');
  assert.equal(JSON.stringify(run.frames[0]), first);
  return run;
}
for (const [kind, lesson] of Object.entries(lessons)) test(`${kind}: all teaching presets match independent reference`, () => {
  for (const [, input] of lesson.examples) check(kind, input);
});

test('randomized searches, histogram, heap, range updates, trie and graph traces', () => {
  let seed = 777;
  const rand = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % n; };
  for (let i = 0; i < 100; i++) {
    const nums = Array.from({ length: rand(12) }, () => rand(19) - 9), target = rand(21) - 10;
    check('linear', { nums, target });
    check('pair', { nums: [...nums].sort((a, b) => a - b), target });
    check('insertion', { nums });
    check('greater', { nums });
    if (nums.length) check('window', { nums, k: rand(nums.length) + 1 });
    check('gcd', { a: rand(200), b: rand(200) + 1 });
    check('binary', { nums: [...nums].sort((a, b) => a - b), target });
    check('lower', { nums: [...nums].sort((a, b) => a - b), target });
    check('histogram', { heights: nums.map(Math.abs) });
    const ranges = nums.length ? Array.from({ length: 6 }, () => [rand(nums.length), rand(nums.length)].sort((a, b) => a - b)) : [];
    check('prefix', { nums, queries: ranges });
    if (nums.length) check('segment', { nums, operations: ranges.flatMap(([a, b]) => [['set', a, rand(11) - 5], ['sum', a, b]]) });
    check('heap', { operations: Array.from({ length: 24 }, () => rand(3) === 0 ? ['pop'] : ['push', rand(31) - 15]) });
    const word = () => Array.from({ length: rand(4) + 1 }, () => 'abc'[rand(3)]).join('');
    check('trie', { words: Array.from({ length: rand(8) }, word), query: word() });
    const n = rand(9) + 1;
    check('bfs', { n, start: rand(n), edges: Array.from({ length: rand(16) }, () => [rand(n), rand(n)]) });
  }
});

test('invalid inputs fail with a useful error instead of changing or sorting input', () => {
  for (const [kind, input] of [
    ['binary', { nums: [2, 1], target: 1 }], ['lower', { nums: [2, 1], target: 1 }],
    ['linear', { nums: [1], target: '1' }], ['histogram', { heights: [-1] }],
    ['heap', { operations: [['push']] }], ['heap', { operations: [['delete', 3]] }],
    ['segment', { nums: [], operations: [] }], ['segment', { nums: [1], operations: [['sum', 0, 1]] }],
    ['prefix', { nums: [1], queries: [[1, 0]] }], ['trie', { words: ['CAT'], query: 'cat' }],
    ['bfs', { n: 2, start: 0, edges: [[0, 2]] }],
    ['pair', { nums: [2, 1], target: 3 }], ['pair', { nums: [], target: null }],
    ['window', { nums: [], k: 1 }], ['window', { nums: [2], k: 0 }], ['window', { nums: [2], k: 2 }],
    ['insertion', { nums: [1.5] }], ['greater', { nums: '123' }],
    ['gcd', { a: 0, b: 0 }], ['gcd', { a: -2, b: 4 }], ['gcd', { a: 2.5, b: 5 }],
  ]) assert.throws(() => parseBasics(kind, JSON.stringify(input)));
});

test('heap instrumentation preserves its existing priority queue API and snapshots', () => {
  const plain = new AuthoredMinHeap(), events = [], instrumented = new AuthoredMinHeap((a, b) => a[0] - b[0], event => events.push(event));
  for (const n of [7, 2, 9, 1, 1, -3]) { plain.push([n]); instrumented.push([n]); }
  const first = JSON.stringify(events[0]);
  while (plain.size) assert.deepEqual(instrumented.pop(), plain.pop());
  assert.equal(instrumented.pop(), undefined);
  assert.equal(JSON.stringify(events[0]), first);
  assert.ok(events.some(e => e.type === 'swap'));
});

test('legacy binary search and histogram consume the same traced algorithms', () => {
  assert.equal(binarySearchSteps([], 1).at(-1).foundIndex, -1);
  assert.equal(histogramSteps([2, 1, 5, 6, 2, 3]).at(-1).best, 10);
  for (const [file, algorithm, view] of [
    ['Problem704/BinarySearchVisualizer.jsx', 'binarySearchSteps', 'SearchWindow'],
    ['Problem84/LargestRectangleInHistogramVisualizer.jsx', 'histogramSteps', 'HistogramBars'],
  ]) {
    const source = fs.readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
    assert.ok(source.includes(algorithm)); assert.ok(source.includes(view));
    assert.ok(!source.includes('function generateSteps('));
  }
});

test('all Basics entries are discoverable, unique and permanently free', async () => {
  const dirs = fs.readdirSync(new URL('../../', import.meta.url)).filter(dir => dir.endsWith('Basics'));
  const slugs = new Set(), numbers = new Set();
  for (const dir of dirs) {
    const { meta } = await import(`../../${dir}/meta.js`);
    assert.ok(fs.existsSync(new URL(`../../${dir}/index.jsx`, import.meta.url)));
    assert.equal(isFreeProblem({ ...meta, implemented: true }), true);
    assert.ok(!slugs.has(meta.slug)); assert.ok(!numbers.has(meta.number));
    slugs.add(meta.slug); numbers.add(meta.number);
  }
  assert.equal(numbers.size, 15);
  assert.deepEqual(BASICS_PROBLEMS.map(p => p.number), Array.from({ length: 15 }, (_, i) => `B${i + 1}`));
  assert.deepEqual(new Set(BASICS_PROBLEMS.map(p => p.slug)), slugs);
});

test('new lesson snapshots preserve their teaching invariants', () => {
  for (const kind of ['pair', 'window', 'insertion', 'greater', 'gcd']) {
    const definition = createBasicsDefinition(kind);
    for (const example of definition.examples) {
      const run = definition.build(definition.parse(example.input));
      for (const frame of run.frames) {
        if (kind === 'window') assert.equal(frame.sum, frame.nums.slice(frame.left, frame.right + 1).reduce((a, b) => a + b, 0));
        if (kind === 'greater') for (let i = 1; i < frame.stack.length; i++) assert.ok(frame.nums[frame.stack[i - 1]] >= frame.nums[frame.stack[i]]);
        if (kind === 'insertion') {
          const values = frame.nums.filter((_, i) => i !== frame.hole);
          if (frame.hole >= 0) values.push(frame.key);
          assert.deepEqual(values.sort((a, b) => a - b), [...run.input.nums].sort((a, b) => a - b));
        }
        if (kind === 'gcd') assert.equal(refs.gcd(frame), run.result);
      }
    }
  }
});
