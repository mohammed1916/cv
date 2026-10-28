import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = values => buildTrace(parseInput(JSON.stringify({ values }))).result

test('1161 official examples', () => {
  assert.equal(solve([1, 7, 0, 7, -8, null, null]), 2)
  assert.equal(solve([989, null, 10250, 98693, -89388, null, null, null, -32127]), 2)
})

test('1161 a tie keeps the smaller level', () => {
  // Level 1 sums to 4 and level 2 also sums to 4, so level 1 wins.
  assert.equal(solve([4, 2, 2]), 1)
})

test('1161 rejects a missing root', () => {
  assert.throws(() => parseInput('{"values":[null]}'))
})

// Independent oracle: accumulate sums by depth during a recursive walk, then scan the depths.
function oracle(values) {
  const root = treeFromLevelOrder(values)
  const sums = []
  const walk = (node, depth) => {
    if (!node) return
    sums[depth] = (sums[depth] ?? 0) + node.value
    walk(node.left, depth + 1)
    walk(node.right, depth + 1)
  }
  walk(root, 0)
  let best = 0
  for (let d = 1; d < sums.length; d++) if (sums[d] > sums[best]) best = d
  return best + 1
}

test('1161 random trees match a depth-sum oracle', () => {
  let seed = 1161
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const values = [rnd(41) - 20]
    const size = 1 + rnd(14)
    for (let i = 1; i < size; i++) values.push(rnd(4) ? rnd(41) - 20 : null)
    assert.equal(solve(values), oracle(values), JSON.stringify(values))
  }
})
