import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = arr => buildTrace(arr).result

test('968 official examples', () => {
  assert.equal(solve([0, 0, null, 0, 0]), 1)
  assert.equal(solve([0, 0, null, 0, null, 0, null, null, 0]), 2)
})

test('968 a single node needs one camera', () => {
  assert.equal(solve([0]), 1)
})

test('968 rejects a null root', () => {
  assert.throws(() => parseInput('[null,0]'))
})

// Independent oracle: try every set of camera positions on a small tree and keep the smallest that covers everything.
function oracle(arr) {
  const root = treeFromLevelOrder(arr)
  const nodes = []
  const parent = new Map()
  const walk = (node, p) => {
    if (!node) return
    nodes.push(node)
    parent.set(node, p)
    walk(node.left, node)
    walk(node.right, node)
  }
  walk(root, null)
  const n = nodes.length
  let best = Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    const camera = new Set(nodes.filter((_, i) => mask & (1 << i)))
    const covered = nodes.every(node => {
      if (camera.has(node)) return true
      const neighbours = [node.left, node.right, parent.get(node)].filter(Boolean)
      return neighbours.some(other => camera.has(other))
    })
    if (covered) best = Math.min(best, camera.size)
  }
  return best
}

test('968 random small trees match an exhaustive search', () => {
  let seed = 59
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rnd(9)
    const arr = [0]
    for (let i = 1; i < size * 2; i++) arr.push(rnd(3) ? 0 : null)
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
