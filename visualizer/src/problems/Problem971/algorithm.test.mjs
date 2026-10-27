import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = (arr, voyage) => buildTrace({ arr, voyage }).result

test('971 official examples', () => {
  assert.deepEqual(solve([1, 2], [2, 1]), [-1])
  assert.deepEqual(solve([1, 2, 3], [1, 3, 2]), [1])
  assert.deepEqual(solve([1, 2, 3], [1, 2, 3]), [])
})

test('971 rejects a voyage that is not a permutation of the nodes', () => {
  assert.throws(() => parseInput('{"arr":[1,2],"voyage":[1,1]}'))
})

// Preorder of the tree after flipping the nodes in `flip` (by value).
function preorderAfter(arr, flip) {
  const out = []
  const walk = node => {
    if (!node) return
    out.push(node.value)
    const [first, second] = flip.has(node.value) ? [node.right, node.left] : [node.left, node.right]
    walk(first)
    walk(second)
  }
  walk(treeFromLevelOrder(arr))
  return out
}

// Independent oracle: try every set of flips, keep the smallest set whose preorder matches the voyage.
function oracle(arr, voyage) {
  const values = arr.filter(v => v !== null)
  let best = null
  for (let mask = 0; mask < 1 << values.length; mask++) {
    const flip = new Set(values.filter((_, i) => mask & (1 << i)))
    const order = preorderAfter(arr, flip)
    if (order.length === voyage.length && order.every((v, i) => v === voyage[i])) {
      if (best === null || flip.size < best.size) best = flip
    }
  }
  return best
}

test('971 random trees: a reported flip set really matches, and the size is minimal', () => {
  let seed = 73
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(7)
    const values = Array.from({ length: n }, (_, i) => i + 1)
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [values[i], values[j]] = [values[j], values[i]] }
    const arr = [values[0]]
    for (let i = 1; i < n; i++) arr.push(values[i])
    // A random voyage: the preorder of a randomly flipped copy of the tree.
    const flip = new Set(values.filter(() => rnd(2)))
    const voyage = preorderAfter(arr, flip)
    const result = solve(arr, voyage)
    const best = oracle(arr, voyage)
    assert.ok(best !== null, JSON.stringify({ arr, voyage }))
    if (result[0] === -1) assert.fail(JSON.stringify({ arr, voyage }))
    assert.deepEqual(preorderAfter(arr, new Set(result)), voyage, JSON.stringify({ arr, voyage }))
    assert.equal(result.length, best.size, JSON.stringify({ arr, voyage }))
  }
})
