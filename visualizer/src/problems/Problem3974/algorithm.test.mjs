import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k, mul) => buildTrace(parseInput(JSON.stringify({ nums, k, mul }))).result

test('3974 official examples', () => {
  assert.equal(solve([6, 1, 2, 9], 3, 2), 26)
  assert.equal(solve([3, 7, 5, 2], 2, 4), 43)
  assert.equal(solve([4, 4], 1, 1), 4)
})

test('3974 once the multiplier is exhausted each element simply adds its value', () => {
  // mul 1 then 1 for the rest: 5 * 1 + 4 * 1 + 3 * 1.
  assert.equal(solve([5, 4, 3], 3, 1), 12)
})

test('3974 rejects k larger than the array', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":2,"mul":1}'))
})

// Independent oracle: try every ordered choice of k indices and every add-or-multiply pattern.
function oracle(nums, k, mul) {
  const n = nums.length
  let best = -Infinity
  const used = Array(n).fill(false)
  const choose = (depth, seq) => {
    if (depth === k) {
      for (let pattern = 0; pattern < 1 << k; pattern++) {
        let total = 0
        let current = mul
        for (let t = 0; t < k; t++) {
          const v = nums[seq[t]]
          const multiply = (pattern >> t) & 1
          total += multiply ? v * current : v
          current -= 1
        }
        if (total > best) best = total
      }
      return
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue
      used[i] = true
      choose(depth + 1, [...seq, i])
      used[i] = false
    }
  }
  choose(0, [])
  return best
}

test('3974 random small inputs match an every-order-and-choice oracle', () => {
  let seed = 3974
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(5)
    const nums = Array.from({ length: n }, () => 1 + rnd(20))
    const k = 1 + rnd(n)
    const mul = 1 + rnd(6)
    assert.equal(solve(nums, k, mul), oracle(nums, k, mul), JSON.stringify({ nums, k, mul }))
  }
})
