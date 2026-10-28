import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

// Independent oracle: try every change of -2..2 on each element, keep the arrays that alternate parity,
// take the smallest total change, then the smallest spread among arrays with that total.
function oracle(nums) {
  let bestCost = Infinity
  let bestSpread = Infinity
  const alt = arr => arr.every((v, i) => i === 0 || (((v % 2) + 2) % 2) !== (((arr[i - 1] % 2) + 2) % 2))
  const walk = (i, arr, cost) => {
    if (i === nums.length) {
      if (!alt(arr)) return
      const spread = Math.max(...arr) - Math.min(...arr)
      if (cost < bestCost || (cost === bestCost && spread < bestSpread)) { bestCost = cost; bestSpread = spread }
      return
    }
    for (let d = -2; d <= 2; d++) walk(i + 1, [...arr, nums[i] + d], cost + Math.abs(d))
  }
  walk(0, [], 0)
  return [bestCost, bestSpread]
}

test('3854 official examples', () => {
  assert.deepEqual(solve([-2, -3, 1, 4]), [2, 6])
  assert.deepEqual(solve([0, 2, -2]), [1, 3])
  assert.deepEqual(solve([7]), [0, 0])
})

test('3854 rejects a non-integer value', () => {
  assert.throws(() => parseInput('{"nums":[1.5]}'))
})

test('3854 random arrays match the enumeration oracle', () => {
  let seed = 3854
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(5) }, () => rnd(11) - 5)
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
