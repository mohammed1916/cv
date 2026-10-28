import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = arr => buildTrace(arr).result

test('1609 official-style examples', () => {
  assert.equal(solve([1, 10, 4, 3, null, 7, 9, 12, 8, 6, null, null, 2]), true)
  assert.equal(solve([1]), true)
  // The root is at depth 0 and must hold an odd value.
  assert.equal(solve([2]), false)
  // Depth 1 must be strictly decreasing: 4 then 10 is increasing.
  assert.equal(solve([1, 4, 10]), false)
})

test('1609 rejects values outside 1 to 1000', () => {
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[1001]'))
})

// Independent oracle: depth-first walk grouping values by depth, then check each group.
function oracle(arr) {
  const root = treeFromLevelOrder(arr)
  const byDepth = []
  const walk = (node, d) => {
    if (!node) return
    ;(byDepth[d] ||= []).push(node.value)
    walk(node.left, d + 1)
    walk(node.right, d + 1)
  }
  walk(root, 0)
  return byDepth.every((vals, d) => {
    const inOrder = vals.every((v, i) => i === 0 || (d % 2 === 0 ? vals[i - 1] < v : vals[i - 1] > v))
    const parity = vals.every(v => (d % 2 === 0 ? v % 2 === 1 : v % 2 === 0))
    return inOrder && parity
  })
}

test('1609 random trees match a depth-first oracle', () => {
  let seed = 1609
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let trues = 0
  for (let t = 0; t < 300; t++) {
    const arr = [1 + rnd(9)]
    for (let i = 0; i < 1 + rnd(14); i++) arr.push(rnd(5) ? 1 + rnd(9) : null)
    const expected = oracle(arr)
    if (expected) trues++
    assert.equal(solve(arr), expected, JSON.stringify(arr))
  }
  assert.ok(trues > 0)
})
