import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (parent, nums, k) => buildTrace(parseInput(JSON.stringify({ parent, nums, k }))).result

test('3939 official examples', () => {
  assert.equal(solve([-1, 0, 1], [1, 2, 3], 3), 1)
  assert.equal(solve([-1, 0, 0, 0], [2, 1, 2, 1], 3), 2)
})

test('3939 a single node counts itself only when its value is divisible by k', () => {
  assert.equal(solve([-1], [3], 3), 1)
  assert.equal(solve([-1], [2], 3), 0)
})

test('3939 rejects a parent index that is not smaller than the child index', () => {
  assert.throws(() => parseInput('{"parent":[-1,2,0],"nums":[1,1,1],"k":1}'), /smaller/)
})

// Independent oracle: enumerate every subset of nodes, then test the sum and the parent rule directly.
function oracle(parent, nums, k) {
  const n = parent.length
  let count = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    let sum = 0
    let ok = true
    for (let i = 0; i < n; i++) {
      if (!((mask >> i) & 1)) continue
      sum += nums[i]
      if (i > 0 && (mask >> parent[i]) & 1) ok = false
    }
    if (ok && sum % k === 0) count++
  }
  return count % (1000000007)
}

test('3939 random trees match an enumerate-every-subset oracle', () => {
  let seed = 3939
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const parent = [-1]
    for (let i = 1; i < n; i++) parent.push(rnd(i))
    const nums = Array.from({ length: n }, () => 1 + rnd(9))
    const k = 1 + rnd(9)
    assert.equal(solve(parent, nums, k), oracle(parent, nums, k), JSON.stringify({ parent, nums, k }))
  }
})
