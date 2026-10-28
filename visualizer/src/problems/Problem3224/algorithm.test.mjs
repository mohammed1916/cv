import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3224 hand-checked examples', () => {
  // Pairs (0,3) and (1,2): change 3 to 1 so both gaps are 1.
  assert.equal(solve([0, 1, 2, 3], 3), 1)
  // Pairs (1,0) and (0,3): change 3 to 1 so both gaps are 1.
  assert.equal(solve([1, 0, 3, 0], 3), 1)
  assert.equal(solve([0, 0, 0, 0], 2), 0)
})

test('3224 rejects odd lengths and values outside 0 to k', () => {
  assert.throws(() => parseInput('{"nums":[1,0,2],"k":3}'))
  assert.throws(() => parseInput('{"nums":[1,4],"k":3}'))
  assert.throws(() => parseInput('{"nums":[1,0],"k":7}'))
})

// Independent oracle: try every array of values 0..k and keep the fewest positions that differ from nums
// among arrays whose mirrored gaps all match.
function oracle(nums, k) {
  const n = nums.length
  const cur = Array(n).fill(0)
  let best = Infinity
  const walk = i => {
    if (i === n) {
      const gap = Math.abs(cur[0] - cur[n - 1])
      for (let j = 1; j < n / 2; j++) if (Math.abs(cur[j] - cur[n - 1 - j]) !== gap) return
      let changes = 0
      for (let j = 0; j < n; j++) if (cur[j] !== nums[j]) changes++
      best = Math.min(best, changes)
      return
    }
    for (let v = 0; v <= k; v++) { cur[i] = v; walk(i + 1) }
  }
  walk(0)
  return best
}

test('3224 random cases match the enumeration oracle', () => {
  let seed = 3224
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 * (rnd(3) + 1)
    const k = rnd(4) + 1
    const nums = Array.from({ length: n }, () => rnd(k + 1))
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
