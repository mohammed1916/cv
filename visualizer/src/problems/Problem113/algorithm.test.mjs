import test from 'node:test';
import assert from 'node:assert/strict';
import {generateSteps} from './algorithm.js';
test('leaf values count toward the sum and all matching routes survive backtracking',()=>{
  const frames=generateSteps('[5,4,8,11,null,13,4,7,2,null,null,5,1]',22);
  assert.deepEqual(frames.at(-1).completedPaths,[[5,4,11,2],[5,8,4,5]]);
  for(const frame of frames)assert.equal(frame.currentSum,frame.pathStack.reduce((a,b)=>a+b,0));
  assert.deepEqual(frames[0].completedPaths,[]);
});
test('negative values, single leaves, internal matches and sparse input',()=>{
  for(const [tree,target,expected] of [['[1]',1,[[1]]],['[1,2]',1,[]],['[-2,null,-3]',-5,[[-2,-3]]],['[]',0,[]]])assert.deepEqual(generateSteps(tree,target).at(-1).completedPaths,expected);
});

import { buildTrace, parseInput, python } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'
import { spawnSync } from 'node:child_process'

const solve = (root, target_sum) => buildTrace(parseInput(JSON.stringify({ root, target_sum }))).result

test('113 official examples', () => {
  assert.deepEqual(solve([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], 22), [[5, 4, 11, 2], [5, 8, 4, 5]])
  assert.deepEqual(solve([1, 2, 3], 5), [])
  assert.deepEqual(solve([1, 2], 0), [])
})

test('113 a single node and an empty tree', () => {
  assert.deepEqual(solve([1], 1), [[1]])
  assert.deepEqual(solve([], 0), [])
})

test('113 rejects a missing field and out-of-range values', () => {
  assert.throws(() => parseInput('{"root":[1]}'))
  assert.throws(() => parseInput('{"root":[1],"target_sum":-5000}'))
})

// Independent oracle: collect leaves left to right with an explicit stack, then rebuild each leaf's
// path from a parent map and keep the paths whose sums match.
function oracle(root, target) {
  if (!root) return []
  const parent = new Map([[root, null]])
  const order = []
  const stack = [root]
  while (stack.length) {
    const node = stack.pop()
    if (!node.left && !node.right) order.push(node)
    for (const child of [node.right, node.left]) {
      if (child) { parent.set(child, node); stack.push(child) }
    }
  }
  // Leaves were pushed right-first, so the explicit stack has them in left-to-right order here.
  const out = []
  for (const leaf of order) {
    const values = []
    for (let n = leaf; n; n = parent.get(n)) values.unshift(n.value)
    if (values.reduce((a, b) => a + b, 0) === target) out.push(values)
  }
  return out
}

test('113 seeded random trees match a parent-map oracle', () => {
  let seed = 113
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = rnd(8) === 0 ? [] : [rnd(5) - 2]
    const size = rnd(14)
    for (let i = 1; i < size && arr.length; i++) arr.push(rnd(3) === 0 ? null : rnd(5) - 2)
    // Orphaned values are rejected by the shared parser; keep only arrays it accepts.
    try { generateSteps(JSON.stringify(arr), 0) } catch { continue }
    const target = rnd(9) - 4
    assert.deepEqual(solve(arr, target), oracle(treeFromLevelOrder(arr), target), JSON.stringify({ arr, target }))
  }
})

test('113 displayed Python returns the same paths', () => {
  const cases = [
    { root: [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], target_sum: 22 },
    { root: [1, 2, 3], target_sum: 5 },
    { root: [], target_sum: 0 },
    { root: [0, 0, 0], target_sum: 0 },
  ]
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([path_sum(c["root"], c["target_sum"]) for c in p["cases"]]))'], {
    input: JSON.stringify({ source: python, cases }), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(c => solve(c.root, c.target_sum)))
})
