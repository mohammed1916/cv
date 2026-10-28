import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2501 official examples', () => {
  assert.equal(solve('{"nums":[4,3,6,16,8,2]}'), 3)
  assert.equal(solve('{"nums":[2,3,5,6,7]}'), -1)
})

test('2501 the streak does not need to be contiguous in the array', () => {
  assert.equal(solve('{"nums":[16,9,2,4]}'), 3)
})

test('2501 rejects 1, whose square is itself', () => {
  assert.throws(() => parseInput('{"nums":[1,2]}'))
})

// Independent oracle: try every subsequence (by bitmask), sort it, and check the square rule.
function oracle(nums) {
  let best = -1
  const n = nums.length
  for (let mask = 1; mask < 1 << n; mask++) {
    const picked = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) picked.push(nums[i])
    picked.sort((a, b) => a - b)
    if (picked.length < 2) continue
    let ok = true
    for (let k = 1; k < picked.length && ok; k++) if (picked[k] !== picked[k - 1] * picked[k - 1]) ok = false
    if (ok) best = Math.max(best, picked.length)
  }
  return best
}

test('2501 random arrays match a subsequence-enumeration oracle', () => {
  let seed = 2501
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pool = [2, 3, 4, 5, 6, 8, 9, 16, 27, 81, 256, 7, 10]
  for (let round = 0; round < 300; round++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => pool[rnd(pool.length)])
    assert.equal(solve(JSON.stringify({ nums })), oracle(nums), JSON.stringify(nums))
  }
})
