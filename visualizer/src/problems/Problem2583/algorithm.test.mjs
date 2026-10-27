import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2583 official examples', () => {
  assert.equal(solve({ root: [5, 8, 9, 2, 1, 3, 7, 4, 6], k: 2 }), 13)
  assert.equal(solve({ root: [1, 2, null, 3], k: 1 }), 3)
  assert.equal(solve({ root: [1, 2, null, 3], k: 3 }), 1)
  assert.equal(solve({ root: [1, 2, null, 3], k: 4 }), -1)
})

test('2583 a single node has one level', () => {
  assert.equal(solve({ root: [-4], k: 1 }), -4)
  assert.equal(solve({ root: [-4], k: 2 }), -1)
})

test('2583 rejects a root that is null', () => {
  assert.throws(() => parseInput('{"root":[null],"k":1}'))
})

// Independent oracle: build the levels with the shared tree helper, then sort every level sum.
function oracle({ root, k }) {
  const sums = []
  let level = [treeFromLevelOrder(root)].filter(Boolean)
  while (level.length) {
    sums.push(level.reduce((s, node) => s + node.value, 0))
    level = level.flatMap(node => [node.left, node.right].filter(Boolean))
  }
  if (sums.length < k) return -1
  return sums.sort((a, b) => b - a)[k - 1]
}

test('2583 seeded random trees match a sort-all oracle', () => {
  let seed = 2583
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const root = [rnd(41) - 20]
    for (let i = 1; i < 1 + rnd(14); i++) root.push(rnd(4) ? rnd(41) - 20 : null)
    const input = { root, k: 1 + rnd(6) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
