import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPathSum, getRoute, parsePathSum } from './algorithm.js';

test('finds the route and short-circuits unexplored siblings', () => {
  const run = buildPathSum([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], 22);
  assert.equal(run.result, true);
  assert.deepEqual(getRoute(run.nodes, run.frames.at(-1).nodeId).map(n => n.value), [5, 4, 11, 2]);
  assert.equal(run.nodes.find(n => n.value === 8).visitAt, Infinity);
  assert.ok(run.frames.some(f => f.phase === 'backtrack'));
});
test('only leaves qualify, and negative values must not be pruned', () => {
  assert.equal(buildPathSum([1, 2], 1).result, false);
  assert.equal(buildPathSum([5, -3], 2).result, true);
  assert.equal(buildPathSum([], 0).result, false);
  assert.equal(buildPathSum([null], 0).result, false);
  assert.equal(buildPathSum([0], 0).result, true);
});
test('duplicate values keep separate identities and correct routes', () => {
  const run = buildPathSum([1, 1, 1, null, null, 2], 4);
  assert.deepEqual(getRoute(run.nodes, run.frames.at(-1).nodeId).map(n => n.id), [0, 2, 3]);
});
test('validates input and orphan nodes', () => {
  for (const value of ['{}', '[1,"2"]', '[1.5]']) assert.throws(() => parsePathSum(value, '3'));
  assert.throws(() => parsePathSum('[1]', ''));
  assert.throws(() => buildPathSum([null, 2], 2));
  assert.throws(() => buildPathSum([1, null, null, 2], 2));
});
test('matches independent exhaustive root-to-leaf oracle on small trees', () => {
  for (let seed = 0; seed < 128; seed++) {
    const values = Array.from({ length: 7 }, (_, i) => ((seed >> i) & 1) ? 1 : -1);
    const sums = [values[0]+values[1]+values[3], values[0]+values[1]+values[4], values[0]+values[2]+values[5], values[0]+values[2]+values[6]];
    for (let target = -4; target <= 4; target++) assert.equal(buildPathSum(values, target).result, sums.includes(target));
  }
});

import { buildTrace, parseInput, python } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'
import { spawnSync } from 'node:child_process'

const solve = (root, target_sum) => buildTrace(parseInput(JSON.stringify({ root, target_sum }))).result

test('112 official examples', () => {
  assert.equal(solve([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], 22), true)
  assert.equal(solve([1, 2, 3], 5), false)
  assert.equal(solve([], 0), false)
})

test('112 a single node matches only its own value', () => {
  assert.equal(solve([1], 1), true)
  assert.equal(solve([1], 0), false)
})

test('112 rejects a missing field and out-of-range values', () => {
  assert.throws(() => parseInput('{"root":[1]}'))
  assert.throws(() => parseInput('{"root":[1],"target_sum":5000}'))
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: list every root-to-leaf sum with an explicit stack, then test membership.
function leafSums(root) {
  const sums = []
  const stack = root ? [[root, 0]] : []
  while (stack.length) {
    const [node, above] = stack.pop()
    const here = above + node.value
    if (!node.left && !node.right) sums.push(here)
    if (node.left) stack.push([node.left, here])
    if (node.right) stack.push([node.right, here])
  }
  return sums
}

test('112 seeded random trees match a leaf-sum oracle', () => {
  let seed = 112
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = rnd(8) === 0 ? [] : [rnd(5) - 2]
    const size = rnd(14)
    for (let i = 1; i < size && arr.length; i++) arr.push(rnd(3) === 0 ? null : rnd(5) - 2)
    // Orphaned values are rejected by the shared parser; keep only arrays it accepts.
    try { buildPathSum(arr, 0) } catch { continue }
    const target = rnd(9) - 4
    const expected = leafSums(treeFromLevelOrder(arr)).includes(target)
    assert.equal(solve(arr, target), expected, JSON.stringify({ arr, target }))
  }
})

test('112 displayed Python returns the same answers', () => {
  const cases = [
    { root: [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], target_sum: 22 },
    { root: [1, 2, 3], target_sum: 5 },
    { root: [], target_sum: 0 },
    { root: [1, 2], target_sum: 3 },
  ]
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([has_path_sum(c["root"], c["target_sum"]) for c in p["cases"]]))'], {
    input: JSON.stringify({ source: python, cases }), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(c => solve(c.root, c.target_sum)))
})
