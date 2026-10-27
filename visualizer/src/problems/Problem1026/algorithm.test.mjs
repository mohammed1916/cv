import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('1026 statement examples', () => {
  assert.equal(solve([8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13]), 7)
  assert.equal(solve([1, null, 2, null, 0, 3]), 3)
})

test('1026 a single node has no ancestor', () => {
  assert.equal(solve([5]), 0)
})

test('1026 rejects a null root', () => {
  assert.throws(() => parseInput('[null,1]'))
})

// Independent oracle: list every root-to-node path, then take the widest pair of values where one is an ancestor of the other.
function oracle(arr) {
  const root = treeFromLevelOrder(arr)
  const paths = []
  const walk = (node, above) => {
    if (!node) return
    const here = [...above, node.value]
    paths.push(here)
    walk(node.left, here)
    walk(node.right, here)
  }
  walk(root, [])
  let best = 0
  for (const path of paths) {
    for (let i = 0; i < path.length; i++) {
      for (let j = i + 1; j < path.length; j++) best = Math.max(best, Math.abs(path[j] - path[i]))
    }
  }
  return best
}

test('1026 random trees match a path-pairs oracle', () => {
  let seed = 1026
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = [rnd(31)]
    for (let i = 1; i < 1 + rnd(14); i++) arr.push(rnd(4) === 0 ? null : rnd(31))
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
