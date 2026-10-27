import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('1123 statement examples', () => {
  assert.equal(solve([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]), 2)
  assert.equal(solve([1]), 1)
  assert.equal(solve([0, 1, 3, null, 2]), 2)
})

test('1123 rejects repeated values', () => {
  assert.throws(() => parseInput('[1,2,2]'))
})

// Independent oracle: list the root-to-leaf paths of every deepest leaf, then take the last node they share.
function oracle(arr) {
  const root = treeFromLevelOrder(arr)
  const leaves = []
  const walk = (node, path) => {
    if (!node) return
    const here = [...path, node]
    if (!node.left && !node.right) leaves.push(here)
    walk(node.left, here)
    walk(node.right, here)
  }
  walk(root, [])
  const maxLen = Math.max(...leaves.map(p => p.length))
  const deepestPaths = leaves.filter(p => p.length === maxLen)
  let shared = null
  for (let i = 0; i < maxLen; i++) {
    if (deepestPaths.every(p => p[i] === deepestPaths[0][i])) shared = deepestPaths[0][i]
    else break
  }
  return shared.value
}

test('1123 random trees match a shared-path oracle', () => {
  let seed = 1123
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const pool = Array.from({ length: 31 }, (_, i) => i)
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const arr = [pool[0]]
    for (let i = 1; i < 1 + rnd(14); i++) arr.push(rnd(4) === 0 ? null : pool[i])
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
