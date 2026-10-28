import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSortedListStory, parseSortedList } from './algorithm.js';
test('construction preserves order, identity and balance for 0 through 200 nodes', () => {
  for (let size = 0; size <= 200; size++) {
    const values = Array.from({length:size}, (_,i) => Math.floor(i/3)-30);
    const story = buildSortedListStory(values), ordered = [];
    function walk(node) {
      if (!node) return 0;
      const l = walk(node.left); ordered.push(node.val); const r = walk(node.right);
      assert.ok(Math.abs(l-r)<=1);
      assert.ok(node.createdAt < node.returnedAt);
      for (const child of [node.left,node.right]) if(child) { assert.ok(node.createdAt < child.createdAt); assert.ok(child.returnedAt < node.returnedAt); }
      return 1+Math.max(l,r);
    }
    walk(story.root);
    assert.deepEqual(ordered,values);
    assert.equal(new Set(story.nodes.map(n=>n.id)).size,size);
    assert.equal(story.frames.at(-1).phase,'done');
  }
});
test('reject unsorted, noninteger and oversized input without substituting an example', () => {
  for (const text of ['[2,1]','[null]','["3"]','{}',JSON.stringify(Array(201).fill(1))]) assert.throws(()=>parseSortedList(text));
  assert.deepEqual(parseSortedList('[-2,-2,0]'),[-2,-2,0]);
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

test('109 official example output is a valid height-balanced BST', () => {
  const nums = [-10, -3, 0, 5, 9]
  checkBalancedBst(nums, solve(nums))
  assert.deepEqual(solve([1, 3]), [1, null, 3])
})

test('109 single value and the canonical root choice', () => {
  assert.deepEqual(solve([4]), [4])
  assert.equal(solve([1, 2, 3, 4, 5, 6, 7])[0], 4)
})

test('109 rejects unsorted, repeated and empty input', () => {
  assert.throws(() => parseInput('[3,1]'))
  assert.throws(() => parseInput('[1,1]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[10001]'))
})

test('109 seeded random sorted arrays yield balanced BSTs with the same values in order', () => {
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

test('109 displayed Python returns the same trees', () => {
  const cases = [[-10, -3, 0, 5, 9], [1, 3], [4], [1, 2, 3, 4, 5, 6, 7]]
  const result = spawnSync(process.env.PYTHON || 'python', ['-c', 'import json,sys\np=json.load(sys.stdin)\nexec(p["source"])\nprint(json.dumps([sorted_list_to_bst(c) for c in p["cases"]]))'], {
    input: JSON.stringify({ source: python, cases }), encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.error?.message)
  assert.deepEqual(JSON.parse(result.stdout), cases.map(solve))
})
