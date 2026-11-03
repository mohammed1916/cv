import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

// Independent oracle: breadth-first search over arrays reachable with at most k swaps of any two positions.
function oracle(nums, k) {
  const n = nums.length
  let level = new Set([nums.join(',')])
  const seen = new Set(level)
  const all = [nums]
  for (let step = 0; step < k; step++) {
    const next = new Set()
    for (const key of level) {
      const arr = key.split(',').map(Number)
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const copy = [...arr]
        ;[copy[i], copy[j]] = [copy[j], copy[i]]
        const id = copy.join(',')
        if (!seen.has(id)) { seen.add(id); next.add(id); all.push(copy) }
      }
    }
    level = next
  }
  let best = -Infinity
  for (const arr of all) {
    for (let l = 0; l < n; l++) {
      let sum = 0
      for (let r = l; r < n; r++) { sum += arr[r]; best = Math.max(best, sum) }
    }
  }
  return best
}

test('3962 authored presets', () => {
  assert.equal(solve([-3, 4, -1, 5], 1), 9)
  assert.equal(solve([2, -7, -4, 6, -1], 2), 8)
})

test('3962 zero swaps is the plain maximum subarray', () => {
  assert.equal(solve([-2, 1, -3, 4, -1, 2, 1, -5, 4], 0), 6)
})

test('3962 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
  assert.throws(() => parseInput('{"nums":[],"k":0}'))
})

test('3962 random small arrays match the swap-search oracle', () => {
  let seed = 3962
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const n = 1 + rnd(5)
    const nums = Array.from({ length: n }, () => rnd(21) - 10)
    const k = rnd(3) % (n + 1)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
