import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, target) => buildTrace({ nums, target }).result

test('2449 official examples', () => {
  assert.equal(solve([8, 12, 6], [2, 14, 10]), 2)
  assert.equal(solve([1, 2, 5], [2, 5, 1]), 0)
})

test('2449 parity classes that already match need no operations', () => {
  assert.equal(solve([3, 4], [4, 3]), 0)
})

test('2449 rejects arrays with different sums', () => {
  assert.throws(() => parseInput(JSON.stringify({ nums: [1, 2], target: [1, 3] })))
})

// Independent oracle: breadth-first search over arrays, where each operation adds 2 to one entry and subtracts 2 from another.
// Arrays are similar when they hold the same multiset, so the goal compares sorted contents.
// Values are kept between 0 and the common sum, which contains every shortest path for these small cases.
function oracle(nums, target) {
  const S = nums.reduce((a, b) => a + b, 0)
  const key = arr => [...arr].sort((a, b) => a - b).join(',')
  const goal = key(target)
  let frontier = [nums]
  const seen = new Set([key(nums)])
  let steps = 0
  while (!frontier.some(arr => key(arr) === goal)) {
    if (frontier.length === 0) throw new Error('target unreachable')
    const next = []
    for (const arr of frontier) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
          if (i === j || arr[i] + 2 > S || arr[j] - 2 < 0) continue
          const t = [...arr]
          t[i] += 2
          t[j] -= 2
          if (!seen.has(key(t))) { seen.add(key(t)); next.push(t) }
        }
      }
    }
    frontier = next
    steps++
  }
  return steps
}

test('2449 random arrays match a breadth-first operation oracle', () => {
  let seed = 2449
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 20000 && checked < 300; t++) {
    const n = 2 + rnd(2)
    const nums = Array.from({ length: n }, () => 1 + rnd(5))
    const target = Array.from({ length: n }, () => 1 + rnd(5))
    const sum = a => a.reduce((x, y) => x + y, 0)
    const odd = a => a.filter(v => v % 2 === 1).length
    if (sum(nums) !== sum(target) || odd(nums) !== odd(target)) continue
    checked++
    assert.equal(solve(nums, target), oracle(nums, target), JSON.stringify({ nums, target }))
  }
  assert.ok(checked >= 100)
})
