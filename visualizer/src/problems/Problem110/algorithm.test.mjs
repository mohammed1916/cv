import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBalancedTree, traceBalance } from './algorithm.js';

test('balanced, empty, duplicate and sparse trees match independent height calculation', () => {
  function height(node) { if (!node) return 0; const l = height(node.left), r = height(node.right); return l < 0 || r < 0 || Math.abs(l-r) > 1 ? -1 : 1 + Math.max(l,r); }
  for (let mask = 0; mask < 256; mask++) {
    const values = [1, ...Array.from({length: 8}, (_, i) => mask & (1 << i) ? 1 : null)];
    let root;
    try { root = parseBalancedTree(JSON.stringify(values)); } catch { continue; }
    assert.equal(traceBalance(root).at(-1).result, height(root) !== -1);
  }
  assert.equal(traceBalance(parseBalancedTree('[]')).at(-1).result, true);
  assert.equal(traceBalance(parseBalancedTree('[1,null,2,null,3]')).at(-1).result, false);
});

test('left failure skips the right subtree and identifies the first actual mismatch', () => {
  const root = parseBalancedTree('[1,2,9,3,null,null,null,4]');
  const frames = traceBalance(root);
  assert.equal(frames.at(-1).result, false);
  assert.equal(frames.some(f => f.activeId === root.right.id), false);
  const propagated = frames.find(f => f.activeId === root.id && f.phase === 'propagate');
  assert.equal(propagated.activeLine, 5);
  assert.equal(propagated.right, null);
  assert.equal(propagated.firstFailure, root.left.id);
  assert.equal(frames.filter(f => f.phase === 'unbalanced').length, 1);
});

test('right failure returns on the right-child guard', () => {
  const frames = traceBalance(parseBalancedTree('[1,null,2,null,3,null,4]'));
  assert.equal(frames.find(f => f.activeId === 0 && f.phase === 'propagate').activeLine, 7);
});

test('reject invalid and orphan input; snapshots do not contain future heights', () => {
  for (const value of ['{}', '[null,1]', '[1,null,null,2]', '["1"]']) assert.throws(() => parseBalancedTree(value));
  const frames = traceBalance(parseBalancedTree('[1,2,3]'));
  assert.equal(frames[0].heights.size, 0);
  assert.equal(frames.at(-1).heights.size, 3);
});

import { buildTrace, parseInput, python } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'
import { spawnSync } from 'node:child_process'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('110 official examples', () => {
  assert.equal(solve([3, 9, 20, null, null, 15, 7]), true)
  assert.equal(solve([1, 2, 2, 3, 3, null, null, 4, 4]), false)
  assert.equal(solve([]), true)
})

test('110 a single long branch is unbalanced', () => {
  assert.equal(solve([1, 2, null, 3]), false)
  assert.equal(solve([1, 2, 3, 4, null, null, 5]), true)
})

test('110 rejects a null root with children and out-of-range values', () => {
  assert.throws(() => parseInput('[null,1]'))
  assert.throws(() => parseInput('[101]'))
})

// Independent oracle: for every node, recompute both subtree heights from scratch and compare them.
function naiveHeight(node) {
  if (!node) return 0
  return 1 + Math.max(naiveHeight(node.left), naiveHeight(node.right))
}
function oracle(root) {
  const stack = root ? [root] : []
  while (stack.length) {
    const node = stack.pop()
    if (Math.abs(naiveHeight(node.left) - naiveHeight(node.right)) > 1) return false
    if (node.left) stack.push(node.left)
    if (node.right) stack.push(node.right)
  }
  return true
}

test('110 seeded random trees match a recompute-every-node oracle', () => {
  let seed = 110
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = rnd(8) === 0 ? [] : [rnd(5)]
    const size = rnd(14)
    for (let i = 1; i < size && arr.length; i++) arr.push(rnd(2) === 0 ? null : rnd(5))
    // Orphaned values are rejected by the shared parser; keep only arrays it accepts.
    try { parseBalancedTree(JSON.stringify(arr)) } catch { continue }
    assert.equal(solve(arr), oracle(treeFromLevelOrder(arr)), JSON.stringify(arr))
  }
})

test('110 displayed Python returns the same answers', () => {
  const cases = [[3, 9, 20, null, null, 15, 7], [1, 2, 2, 3, 3, null, null, 4, 4], [], [1, 2, null, 3]]
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([is_balanced(c) for c in p["cases"]]))'], {
    input: JSON.stringify({ source: python, cases }), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(solve))
})
