import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3409 hand-checked examples', () => {
  // 16, 6, 3 has differences 10 then 3, which decrease strictly.
  assert.equal(solve([16, 6, 3]), 3)
  // 5, 1, 4, 2 has differences 4, 3, 2.
  assert.equal(solve([5, 1, 4, 2]), 4)
})

test('3409 a single value gives a subsequence of length one', () => {
  assert.equal(solve([7]), 1)
})

test('3409 rejects a value of zero', () => {
  assert.throws(() => parseInput('{"nums":[0,1]}'))
})

// Independent oracle: enumerate every subsequence and check its adjacent differences directly.
function oracle(nums) {
  const n = nums.length
  let best = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    const chosen = nums.filter((_, i) => (mask >> i) & 1)
    let ok = true
    for (let t = 0; t + 2 < chosen.length && ok; t++) {
      const first = Math.abs(chosen[t] - chosen[t + 1])
      const second = Math.abs(chosen[t + 1] - chosen[t + 2])
      if (!(first > second)) ok = false
    }
    if (ok && chosen.length > best) best = chosen.length
  }
  return best
}

test('3409 seeded random arrays match a subsequence enumeration', () => {
  let seed = 3409
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(9))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
