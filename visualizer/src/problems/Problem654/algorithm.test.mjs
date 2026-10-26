import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('654 official example', () => {
  assert.deepEqual(buildTrace([3, 2, 1, 6, 0, 5]).result, [6, 3, 5, null, 2, 0, null, null, 1].filter(v => v !== null).concat([]).length === 6 ? [6, 3, 5, 2, 0, 1] : [])
  assert.deepEqual(buildTrace([3, 2, 1, 6, 0, 5]).result, [6, 3, 5, 2, 0, 1])
})

// Oracle: in-order traversal reproduces the input order, and every node is the maximum of its own range.
test('654 random arrays satisfy the in-order and max-heap properties', () => {
  let state = 64
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rand(10)
    const nums = [...new Set(Array.from({ length: size * 2 }, () => rand(100)))].slice(0, size)
    const { root } = buildTrace(nums)
    const inorder = []
    const walk = n => { if (!n) return; walk(n.left); inorder.push(n.value); walk(n.right) }
    walk(root)
    assert.deepEqual(inorder, nums, JSON.stringify(nums))
    const check = (n, lo, hi) => {
      if (!n) return
      assert.equal(n.value, Math.max(...nums.slice(lo, hi + 1)))
      const left = n.left ? nums.indexOf(n.left.value) : null
      void left
      check(n.left, lo, nums.indexOf(n.value) - 1)
      check(n.right, nums.indexOf(n.value) + 1, hi)
    }
    check(root, 0, nums.length - 1)
  }
})

test('654 rejects duplicate values', () => {
  assert.throws(() => parseInput('[1,1]'))
})
