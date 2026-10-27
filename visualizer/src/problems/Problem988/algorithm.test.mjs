import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = arr => buildTrace(arr).result

test('988 official examples', () => {
  assert.equal(solve([0, 1, 2, 3, 4, 3, 4]), 'dba')
  assert.equal(solve([25, 1, 3, 1, 3, 0, 2]), 'adz')
  assert.equal(solve([2, 2, 1, null, 1, 0, null, 0]), 'abc')
})

test('988 the smaller of two leaf strings wins', () => {
  // The leaf 0 reads "ab" and the leaf 2 reads "cb"; "ab" is smaller.
  assert.equal(solve([1, 0, 2]), 'ab')
  // A single leaf reads its whole path from the leaf up.
  assert.equal(solve([1, 0, null, 1]), 'bab')
})

test('988 rejects a value outside a to z', () => {
  assert.throws(() => parseInput('[26]'))
})

// Independent oracle: list every root-to-leaf path, reverse each, and take the minimum.
function oracle(arr) {
  const root = treeFromLevelOrder(arr)
  const words = []
  const paths = (node, above) => {
    if (!node) return
    const here = [...above, String.fromCharCode(97 + node.value)]
    if (!node.left && !node.right) words.push(here.reverse().join(''))
    else {
      paths(node.left, here)
      paths(node.right, here)
    }
  }
  paths(root, [])
  return words.reduce((a, b) => (b < a ? b : a))
}

test('988 random trees match a list-of-paths oracle', () => {
  let seed = 163
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = [rnd(3)]
    for (let i = 1; i < 1 + rnd(12); i++) arr.push(rnd(4) ? rnd(3) : null)
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
