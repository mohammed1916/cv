import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = arr => buildTrace(arr).result

test('979 official examples', () => {
  assert.equal(solve([3, 0, 0]), 2)
  assert.equal(solve([0, 3, 0]), 3)
  assert.equal(solve([1]), 0)
})

test('979 rejects a coin total that differs from the node count', () => {
  assert.throws(() => parseInput('[3,0,0,0]'))
})

// Independent oracle: breadth-first search over coin placements. Each step moves one coin along one edge,
// and the goal is one coin on every node. The state is indexed by node id.
function oracle(arr) {
  const root = treeFromLevelOrder(arr)
  const n = arr.filter(v => v !== null).length
  const edges = []
  const start = Array(n).fill(0)
  const walk = node => {
    if (!node) return
    start[node.id] = node.value
    for (const child of [node.left, node.right]) {
      if (child) edges.push([node.id, child.id])
    }
    walk(node.left)
    walk(node.right)
  }
  walk(root)
  const goal = Array(n).fill(1).join(',')
  const seen = new Set([start.join(',')])
  let frontier = [start]
  let steps = 0
  while (frontier.length) {
    if (frontier.some(state => state.join(',') === goal)) return steps
    const next = []
    for (const state of frontier) {
      for (const [a, b] of edges) {
        for (const [from, to] of [[a, b], [b, a]]) {
          if (state[from] === 0) continue
          const moved = [...state]
          moved[from]--
          moved[to]++
          const key = moved.join(',')
          if (!seen.has(key)) {
            seen.add(key)
            next.push(moved)
          }
        }
      }
    }
    frontier = next
    steps++
  }
  return null
}

test('979 random small trees match a coin-movement search', () => {
  let seed = 97
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const m = 1 + rnd(5)
    // Any list of m values summing to m is a valid input: a level-order tree of m nodes with m coins.
    const coins = Array(m).fill(0)
    for (let c = 0; c < m; c++) coins[rnd(m)]++
    assert.equal(solve(coins), oracle(coins), JSON.stringify(coins))
  }
})
