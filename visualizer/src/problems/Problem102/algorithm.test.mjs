import test from 'node:test';
import assert from 'node:assert/strict';
import {generateSteps} from './algorithm.js';
test('FIFO retains unprocessed current-level nodes before newly added children',()=>{
  const frames=generateSteps('[3,9,20,null,null,15,7]');
  assert.deepEqual(frames.at(-1).levels,[[3],[9,20],[15,7]]);
  const visit9=frames.find(f=>f.phase==='visit'&&f.activeIds.has(1));
  assert.deepEqual(visit9.queue.map(n=>n.val),[20]);
  const enqueue15=frames.find(f=>f.activeLine===10&&f.activeIds.has(2));
  assert.deepEqual(enqueue15.queue.map(n=>n.val),[15]);
  assert.deepEqual(frames[0].levels,[]);
});
test('sparse chains and empty input keep level boundaries',()=>{
  assert.deepEqual(generateSteps('[1,null,2,null,3]').at(-1).levels,[[1],[2],[3]]);
  assert.deepEqual(generateSteps('[]').at(-1).levels,[]);
  assert.throws(()=>generateSteps('[1,null,null,2]'));
});

import { buildTrace, parseInput, python } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'
import { spawnSync } from 'node:child_process'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('102 official examples', () => {
  assert.deepEqual(solve([3, 9, 20, null, null, 15, 7]), [[3], [9, 20], [15, 7]])
  assert.deepEqual(solve([1]), [[1]])
  assert.deepEqual(solve([]), [])
})

test('102 skewed and sparse trees keep their levels', () => {
  assert.deepEqual(solve([1, null, 2, null, 3]), [[1], [2], [3]])
  assert.deepEqual(solve([1, 2, null, 3]), [[1], [2], [3]])
})

test('102 rejects a null root with children and out-of-range values', () => {
  assert.throws(() => parseInput('[null,1]'))
  assert.throws(() => parseInput('[1001]'))
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

test('102 seeded random trees match a depth-bucket oracle', () => {
  let seed = 102
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = [rnd(5)]
    const size = rnd(14)
    for (let i = 1; i < size; i++) arr.push(rnd(3) === 0 ? null : rnd(5))
    assert.deepEqual(solve(arr), depthBuckets(treeFromLevelOrder(arr), 0, []), JSON.stringify(arr))
  }
})

test('102 displayed Python returns the same levels', () => {
  const cases = [[3, 9, 20, null, null, 15, 7], [1], [1, null, 2, null, 3], [1, 2, 3, 4, 5, 6, 7]]
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([level_order(c) for c in p["cases"]]))'], {
    input: JSON.stringify({ source: python, cases }), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(solve))
})
