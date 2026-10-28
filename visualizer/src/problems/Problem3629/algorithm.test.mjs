import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3629 official examples', () => {
  assert.equal(solve([1, 2, 4, 6]), 2)
  assert.equal(solve([2, 3, 4, 7, 9]), 2)
  assert.equal(solve([4, 6, 5, 8]), 3)
})

test('3629 a single index needs no jumps', () => {
  assert.equal(solve([1]), 0)
})

test('3629 rejects zero and an empty array', () => {
  assert.throws(() => parseInput('[0,1]'))
  assert.throws(() => parseInput('[]'))
})

// Independent oracle: an explicit adjacency matrix with every allowed edge, then plain breadth-first search.
function oracle(nums) {
  const n = nums.length
  const adj = Array.from({ length: n }, () => new Array(n).fill(false))
  const isPrime = v => { if (v < 2) return false; for (let d = 2; d * d <= v; d++) if (v % d === 0) return false; return true }
  for (let i = 0; i < n; i++) {
    if (i > 0) adj[i][i - 1] = true
    if (i + 1 < n) adj[i][i + 1] = true
    if (isPrime(nums[i])) for (let j = 0; j < n; j++) if (nums[j] % nums[i] === 0) adj[i][j] = true
  }
  const dist = new Array(n).fill(-1)
  dist[0] = 0
  const queue = [0]
  for (let h = 0; h < queue.length; h++) {
    for (let j = 0; j < n; j++) if (adj[queue[h]][j] && dist[j] === -1) { dist[j] = dist[queue[h]] + 1; queue.push(j) }
  }
  return dist[n - 1]
}

test('3629 random arrays match an adjacency-matrix oracle', () => {
  let seed = 3629
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(30))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
