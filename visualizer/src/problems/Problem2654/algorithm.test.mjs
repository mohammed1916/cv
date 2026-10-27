import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('2654 official examples', () => {
  assert.equal(solve([2, 6, 3, 4]), 4)
  assert.equal(solve([2, 10, 6, 14]), -1)
})

test('2654 existing ones need one operation each for the rest', () => {
  assert.equal(solve([1, 5, 1, 7]), 2)
})

test('2654 rejects an empty array', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Independent oracle: breadth-first search over arrays. An operation replaces nums[i] or nums[i+1]
// with their gcd, so every reachable array is explored level by level until all ones appear.
function oracle(start) {
  const gcdOf = (a, b) => { while (b) [a, b] = [b, a % b]; return a }
  const key = arr => arr.join(',')
  const seen = new Set([key(start)])
  let level = [start]
  for (let steps = 0; level.length; steps++) {
    if (level.some(arr => arr.every(v => v === 1))) return steps
    const next = []
    for (const arr of level) {
      for (let i = 0; i + 1 < arr.length; i++) {
        const g = gcdOf(arr[i], arr[i + 1])
        for (const pos of [i, i + 1]) {
          const copy = [...arr]
          copy[pos] = g
          if (!seen.has(key(copy))) { seen.add(key(copy)); next.push(copy) }
        }
      }
    }
    level = next
  }
  return -1
}

test('2654 small random arrays match a breadth-first oracle', () => {
  let seed = 2654
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const nums = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(10))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
