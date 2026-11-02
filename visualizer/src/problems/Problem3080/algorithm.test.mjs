import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, queries) => buildTrace({ nums, queries }).result

test('3080 worked example', () => {
  assert.deepEqual(solve([1, 2, 2, 1, 2, 3, 1], [[1, 2], [3, 3], [4, 2]]), [8, 3, 0])
})

test('3080 edge cases', () => {
  assert.deepEqual(solve([5], [[0, 0]]), [0])
  assert.deepEqual(solve([5], [[0, 3]]), [0])
  assert.deepEqual(solve([3, 1, 2], [[1, 0], [1, 5]]), [5, 0])
  assert.throws(() => parseInput('{"nums":[1],"queries":[[2,0]]}'))
})

// Independent oracle: keep a list of unmarked objects and repeatedly remove the minimum by linear scan.
function oracle(nums, queries) {
  let pool = nums.map((value, index) => ({ value, index }))
  const out = []
  let total = nums.reduce((a, b) => a + b, 0)
  for (const [idx, k] of queries) {
    const hit = pool.find(p => p.index === idx)
    if (hit) { pool = pool.filter(p => p !== hit); total -= hit.value }
    for (let step = 0; step < k && pool.length; step++) {
      let best = 0
      for (let j = 1; j < pool.length; j++) {
        const a = pool[j], b = pool[best]
        if (a.value < b.value || (a.value === b.value && a.index < b.index)) best = j
      }
      total -= pool[best].value
      pool.splice(best, 1)
    }
    out.push(total)
  }
  return out
}

test('3080 random inputs match the linear-scan oracle', () => {
  let seed = 3080
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => 1 + rnd(6))
    const queries = Array.from({ length: 1 + rnd(6) }, () => [rnd(n), rnd(n + 2)])
    assert.deepEqual(solve(nums, queries), oracle(nums, queries), JSON.stringify({ nums, queries }))
  }
})
