import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3077 official examples', () => {
  assert.equal(solve({ nums: [1, 2, 3, -1, 2], k: 3 }), 22)
  assert.equal(solve({ nums: [12, -2, -2, -2, -2], k: 5 }), 64)
  assert.equal(solve({ nums: [-1, -2, -3], k: 1 }), -1)
})

test('3077 k must not exceed the length', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
})

// Independent oracle: try every set of k disjoint subarrays, ordered left to right, and score each set directly.
function oracle({ nums, k }) {
  const n = nums.length
  let best = -Infinity
  const choose = (start, chosen) => {
    if (chosen.length === k) {
      let strength = 0
      chosen.forEach(([l, r], idx) => {
        const sum = nums.slice(l, r + 1).reduce((a, b) => a + b, 0)
        const sign = idx % 2 === 0 ? 1 : -1
        strength += sign * (k - idx) * sum
      })
      best = Math.max(best, strength)
      return
    }
    for (let l = start; l < n; l++) for (let r = l; r < n; r++) choose(r + 1, [...chosen, [l, r]])
  }
  choose(0, [])
  return best
}

test('3077 random inputs match an enumeration oracle', () => {
  let seed = 3077
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => rnd(21) - 10)
    const k = 1 + rnd(nums.length)
    const input = { nums, k }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
