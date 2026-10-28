import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSortedArrayStory} from './algorithm.js';
test('sorted-array story uses direct intervals without list-copy frames',()=>{
  const story=buildSortedArrayStory('[-10,-3,0,5,9]');
  assert.equal(story.root.val,0);
  assert.equal(story.frames.some(f=>f.activeLine===12),false);
  assert.equal(story.frames.at(-1).activeLine,9);
  assert.equal(story.nodes.length,5);
});
test('input is validated rather than silently sorted or replaced',()=>{
  for(const input of ['[3,1,2]','[1,1]','[null]'])assert.throws(()=>buildSortedArrayStory(input));
  assert.equal(buildSortedArrayStory('[]').root,null);
});

import { buildTrace, parseInput, python } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'
import { spawnSync } from 'node:child_process'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

// Any valid answer is accepted by LeetCode; this checks the tree's properties instead of one shape.
function checkBalancedBst(nums, levels) {
  const root = treeFromLevelOrder(levels)
  const inorder = []
  const height = node => {
    if (!node) return 0
    const l = height(node.left)
    inorder.push(node.value)
    const r = height(node.right)
    assert.ok(Math.abs(l - r) <= 1)
    return 1 + Math.max(l, r)
  }
  height(root)
  assert.deepEqual(inorder, nums)
}

test('108 official example output is a valid height-balanced BST', () => {
  const nums = [-10, -3, 0, 5, 9]
  checkBalancedBst(nums, solve(nums))
  assert.deepEqual(solve([1, 3]), [1, null, 3])
})

test('108 single value and the canonical root choice', () => {
  assert.deepEqual(solve([4]), [4])
  assert.equal(solve([1, 2, 3, 4, 5, 6, 7])[0], 4)
})

test('108 rejects unsorted, repeated and empty input', () => {
  assert.throws(() => parseInput('[3,1]'))
  assert.throws(() => parseInput('[1,1]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[10001]'))
})

test('108 seeded random sorted arrays yield balanced BSTs with the same values in order', () => {
  let seed = 108
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rnd(15)
    const nums = []
    let v = rnd(20) - 10
    for (let i = 0; i < size; i++) { nums.push(v); v += 1 + rnd(4) }
    const levels = solve(nums)
    checkBalancedBst(nums, levels)
    assert.equal(levels[0], nums[Math.floor((size - 1) / 2)])
  }
})

test('108 displayed Python returns the same trees', () => {
  const cases = [[-10, -3, 0, 5, 9], [1, 3], [4], [1, 2, 3, 4, 5, 6, 7]]
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([sorted_array_to_bst(c) for c in p["cases"]]))'], {
    input: JSON.stringify({ source: python, cases }), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(solve))
})
