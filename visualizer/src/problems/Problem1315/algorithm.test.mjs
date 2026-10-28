import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = values => buildTrace(parseInput(JSON.stringify({ values }))).result

test('1315 official examples', () => {
  assert.equal(solve([6, 7, 8, 2, 7, 1, 3, 9, null, 1, 4, null, null, null, 5]), 18)
  assert.equal(solve([1]), 0)
})

test('1315 the four grandchildren of the root are counted', () => {
  assert.equal(solve([2, 3, 4, 5, 6, 7, 8]), 26)
})

test('1315 rejects a value outside 1 to 100', () => {
  assert.throws(() => parseInput('{"values":[0]}'))
})

// Independent oracle: enumerate every root-to-node path and test the node two steps below the path start.
function oracle(values) {
  const root = treeFromLevelOrder(values)
  let total = 0
  const walk = (node, path) => {
    if (!node) return
    const here = [...path, node.value]
    if (here.length >= 3 && here[here.length - 3] % 2 === 0) total += node.value
    walk(node.left, here)
    walk(node.right, here)
  }
  walk(root, [])
  return total
}

test('1315 random trees match a root-path oracle', () => {
  let seed = 1315
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const values = [1 + rnd(100)]
    const size = 1 + rnd(14)
    for (let i = 1; i < size; i++) values.push(rnd(4) ? 1 + rnd(100) : null)
    assert.equal(solve(values), oracle(values), JSON.stringify(values))
  }
})
