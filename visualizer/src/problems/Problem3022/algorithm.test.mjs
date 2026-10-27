import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3022 official examples', () => {
  assert.equal(solve([3, 5, 3, 2, 7], 2), 3)
  assert.equal(solve([7, 3, 15, 14, 2, 8], 4), 2)
  assert.equal(solve([10, 7, 10, 3, 9, 14, 9, 4], 1), 15)
})

test('3022 edge cases', () => {
  assert.equal(solve([0], 0), 0)
  assert.equal(solve([5, 6], 0), 7)
})

test('3022 rejects values above 15', () => {
  assert.throws(() => parseInput('{"nums":[16],"k":0}'))
  assert.throws(() => parseInput('{"nums":[1],"k":8}'))
})

// Independent oracle: explore every array reachable within k merges and take the smallest OR of what remains.
function oracle(nums, k) {
  let level = new Map([[nums.join(','), nums]])
  const seen = new Set(level.keys())
  const orOf = arr => arr.reduce((a, b) => a | b, 0)
  let best = orOf(nums)
  for (let step = 0; step < k; step++) {
    const next = new Map()
    for (const arr of level.values()) {
      for (let i = 0; i + 1 < arr.length; i++) {
        const merged = [...arr.slice(0, i), arr[i] & arr[i + 1], ...arr.slice(i + 2)]
        const key = merged.join(',')
        if (!seen.has(key)) { seen.add(key); next.set(key, merged) }
      }
    }
    for (const arr of next.values()) best = Math.min(best, orOf(arr))
    level = next
  }
  return best
}

test('3022 random arrays match an exhaustive search over merges', () => {
  let seed = 3022
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => rnd(16))
    const k = rnd(6)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
