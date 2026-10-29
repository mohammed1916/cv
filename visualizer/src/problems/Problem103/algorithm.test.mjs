import test from 'node:test';
import assert from 'node:assert/strict';
import {generateSteps} from './algorithm.js';
test('reverse changes output row, not the queue, and saving occurs after reversal',()=>{
  const frames=generateSteps('[3,9,20,null,null,15,7]');
  assert.deepEqual(frames.at(-1).result,[[3],[20,9],[15,7]]);
  const index=frames.findIndex(f=>f.phase==='reverse'&&!f.leftToRight);
  assert.deepEqual(frames[index].level,[20,9]);
  assert.deepEqual(frames[index].result,[[3]]);
  assert.deepEqual(frames[index].queue.map(n=>n.val),[15,7]);
  assert.deepEqual(frames[index+1].result,[[3],[20,9]]);
});
test('empty root and sparse trees are truthful',()=>{
  assert.deepEqual(generateSteps('[null]').at(-1).result,[]);
  assert.deepEqual(generateSteps('[1,null,2,null,3]').at(-1).result,[[1],[2],[3]]);
});

import { buildTrace, parseInput, python } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'
import { spawnSync } from 'node:child_process'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('103 official examples', () => {
  assert.deepEqual(solve([3, 9, 20, null, null, 15, 7]), [[3], [20, 9], [15, 7]])
  assert.deepEqual(solve([1]), [[1]])
  assert.deepEqual(solve([]), [])
})

test('103 skewed and sparse trees keep their levels', () => {
  assert.deepEqual(solve([1, null, 2, null, 3]), [[1], [2], [3]])
  assert.deepEqual(solve([1, 2, 3, 4, null, null, 5]), [[1], [3, 2], [4, 5]])
})

test('103 rejects a null root with children and out-of-range values', () => {
  assert.throws(() => parseInput('[null,1]'))
  assert.throws(() => parseInput('[101]'))
  assert.throws(() => parseInput('[1.5]'))
})

// Independent oracle: place each value in a bucket by its depth found with a depth-first walk.
function depthBuckets(node, depth, out) {
  if (!node) return out
  ;(out[depth] ||= []).push(node.value)
  depthBuckets(node.left, depth + 1, out)
  depthBuckets(node.right, depth + 1, out)
  return out
}

test('103 seeded random trees match a depth-bucket oracle', () => {
  let seed = 102
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = [rnd(5)]
    const size = rnd(14)
    for (let i = 1; i < size; i++) arr.push(rnd(3) === 0 ? null : rnd(5))
    // Orphaned values are rejected by the shared parser; keep only arrays it accepts.
    try { generateSteps(JSON.stringify(arr)) } catch { continue }
    const levels = depthBuckets(treeFromLevelOrder(arr), 0, [])
    const expected = levels.map((row, d) => (d % 2 === 1 ? row.reverse() : row))
    assert.deepEqual(solve(arr), expected, JSON.stringify(arr))
  }
})

test('103 displayed Python returns the same levels', () => {
  const cases = [[3, 9, 20, null, null, 15, 7], [1], [1, null, 2, null, 3], [1, 2, 3, 4, 5, 6, 7]]
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([zigzag_level_order(c) for c in p["cases"]]))'], {
    input: JSON.stringify({ source: python, cases }), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(solve))
})
