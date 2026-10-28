import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (parent, nums) => buildTrace({ parent, nums }).result

test('4015 official examples', () => {
  assert.equal(solve([-1, 0, 0, 0, 2, 2], [5, 2, 3, 1, 4, 6]), 37)
  assert.equal(solve([-1, 0, 1, 2], [1, 2, 3, 4]), 20)
})

test('4015 a single root has weight equal to its value', () => {
  assert.equal(solve([-1], [9]), 9)
})

test('4015 rejects a cycle that never reaches the root', () => {
  assert.throws(() => parseInput('{"parent":[-1,2,1],"nums":[1,1,1]}'))
})

// Independent oracle: build child lists and compute depths by breadth-first search from the root.
function oracle(parent, nums) {
  const n = parent.length
  const children = Array.from({ length: n }, () => [])
  for (let i = 1; i < n; i++) children[parent[i]].push(i)
  const depth = Array(n).fill(0)
  let frontier = [0]
  let level = 1
  while (frontier.length) {
    const next = []
    for (const v of frontier) {
      depth[v] = level
      next.push(...children[v])
    }
    frontier = next
    level++
  }
  const height = Math.max(...depth)
  return nums.reduce((sum, value, i) => sum + value * (height - depth[i] + 1), 0)
}

test('4015 random trees match a breadth-first oracle', () => {
  let seed = 4015
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const parent = [-1]
    for (let i = 1; i < n; i++) parent.push(rnd(i))
    const nums = Array.from({ length: n }, () => 1 + rnd(20))
    assert.equal(solve(parent, nums), oracle(parent, nums), JSON.stringify({ parent, nums }))
  }
})
