import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = tree => buildTrace(parseInput(JSON.stringify({ tree }))).result

// Independent oracle: start a walk at every node and at every first direction, alternating until the walk is stuck.
function oracle(arr) {
  const root = buildTrace({ tree: arr }).root
  const nodes = []
  const collect = node => { if (node) { nodes.push(node); collect(node.left); collect(node.right) } }
  collect(root)
  let best = 0
  for (const start of nodes) {
    for (const first of ['left', 'right']) {
      let current = start
      let dir = first
      let length = 0
      while (current[dir]) {
        current = current[dir]
        length++
        dir = dir === 'left' ? 'right' : 'left'
      }
      best = Math.max(best, length)
    }
  }
  return best
}

test('1372 single node and small examples', () => {
  assert.equal(solve([1]), 0)
  assert.equal(solve([1, null, 1, 1, 1, null, null, 1, 1, null, 1]), 3)
  assert.equal(solve([1, 1, 1, null, 1, null, null, 1, 1, null, 1]), 4)
})

test('1372 a straight line has no zigzag beyond one edge', () => {
  assert.equal(solve([1, null, 2, null, 3, null, 4]), 1)
})

test('1372 rejects a value outside 0 to 9', () => {
  assert.throws(() => parseInput('{"tree":[10]}'))
})

test('1372 random trees match a walk-from-every-node oracle', () => {
  let seed = 1372
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = [rnd(10)]
    const extra = 1 + rnd(14)
    for (let i = 1; i < extra; i++) arr.push(rnd(3) ? rnd(10) : null)
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
