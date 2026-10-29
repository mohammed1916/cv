import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMinimumDepth, parseMinimumDepth, routeTo } from './algorithm.js';

test('canonical tree and empty or single-root cases', () => {
  const run = buildMinimumDepth([3,9,20,null,null,15,7]);
  assert.equal(run.result, 2);
  assert.deepEqual(routeTo(run.nodes, run.frames.at(-1).bestLeaf).map(n => n.val), [3,9]);
  assert.equal(buildMinimumDepth([]).result, 0);
  assert.equal(buildMinimumDepth([null]).result, 0);
  assert.equal(buildMinimumDepth([7]).result, 1);
  assert.equal(buildMinimumDepth([7]).frames.at(-1).activeLine, 7);
});
test('sparse level-order chain follows the real child instead of missing branch', () => {
  const run = buildMinimumDepth([2,null,3,null,4,null,5,null,6]);
  assert.equal(run.result, 5);
  assert.equal(run.frames.filter(f => f.phase === 'missing_child').length, 4);
  assert.ok(run.frames.filter(f => f.phase === 'missing_child').every(f => f.activeLine === 9));
  assert.deepEqual(run.frames.filter(f => f.phase === 'return').map(f => f.returnedDepth), [2,3,4,5]);
});
test('duplicate node values remain distinct and ties retain a valid route', () => {
  const run = buildMinimumDepth([1,1,1]);
  assert.equal(run.result, 2);
  assert.deepEqual(routeTo(run.nodes, run.frames.at(-1).bestLeaf).map(n => n.id), [0,1]);
});
test('reject malformed input and orphan children', () => {
  for (const source of ['{}','[1,"2"]','[1.1]']) assert.throws(() => parseMinimumDepth(source));
  assert.throws(() => buildMinimumDepth([1,null,null,3]));
  assert.throws(() => buildMinimumDepth([null,2]));
});
test('exhaustive sparse trees agree with an independent BFS minimum-depth oracle', () => {
  for (let mask = 0; mask < 256; mask++) {
    const input = [0];
    const queue = [{ depth: 1 }];
    let head = 0, bit = 0, expected = Infinity;
    while (head < queue.length) {
      const { depth } = queue[head++];
      let children = 0;
      for (let side = 0; side < 2; side++) {
        const present = bit < 8 && ((mask >> bit) & 1);
        bit++;
        input.push(present ? -1 : null);
        if (present) { children++; queue.push({ depth: depth + 1 }); }
      }
      if (!children) expected = Math.min(expected, depth);
    }
    const run = buildMinimumDepth(input);
    assert.equal(run.result, expected, JSON.stringify(input));
    assert.equal(routeTo(run.nodes, run.frames.at(-1).bestLeaf).length, expected);
  }
});
test('deep chains do not depend on the JavaScript call stack', () => {
  const input = [0];
  for (let i = 1; i < 5000; i++) input.push(null, i);
  assert.equal(buildMinimumDepth(input).result, 5000);
});

import { buildTrace, parseInput, python } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'
import { spawnSync } from 'node:child_process'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('111 official examples', () => {
  assert.equal(solve([3, 9, 20, null, null, 15, 7]), 2)
  assert.equal(solve([2, null, 3, null, 4, null, 5, null, 6]), 5)
})

test('111 empty tree, single node and a missing child is not a leaf', () => {
  assert.equal(solve([]), 0)
  assert.equal(solve([7]), 1)
  assert.equal(solve([1, 2]), 2)
})

test('111 rejects a null root with children and out-of-range values', () => {
  assert.throws(() => parseInput('[null,1]'))
  assert.throws(() => parseInput('[1001]'))
})

// Independent oracle: breadth-first search that stops at the first leaf it reaches.
function oracle(root) {
  if (!root) return 0
  let level = [root]
  let depth = 1
  for (;;) {
    const next = []
    for (const node of level) {
      if (!node.left && !node.right) return depth
      if (node.left) next.push(node.left)
      if (node.right) next.push(node.right)
    }
    level = next
    depth++
  }
}

test('111 seeded random trees match a breadth-first oracle', () => {
  let seed = 111
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = rnd(8) === 0 ? [] : [rnd(5)]
    const size = rnd(14)
    for (let i = 1; i < size && arr.length; i++) arr.push(rnd(3) === 0 ? null : rnd(5))
    // Orphaned values are rejected by the shared parser; keep only arrays it accepts.
    try { buildMinimumDepth(arr) } catch { continue }
    assert.equal(solve(arr), oracle(treeFromLevelOrder(arr)), JSON.stringify(arr))
  }
})

test('111 displayed Python returns the same depths', () => {
  const cases = [[3, 9, 20, null, null, 15, 7], [2, null, 3, null, 4, null, 5, null, 6], [], [1, 2]]
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([min_depth(c) for c in p["cases"]]))'], {
    input: JSON.stringify({ source: python, cases }), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(solve))
})
