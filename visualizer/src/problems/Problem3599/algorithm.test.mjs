import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3599 hand-checked examples', () => {
  // One piece: 1 ^ 2 ^ 3 = 0.
  assert.equal(solve([1, 2, 3], 1), 0)
  // Three single-value pieces: 1 + 2 + 3 = 6.
  assert.equal(solve([1, 2, 3], 3), 6)
})

test('3599 splitting can beat one large piece', () => {
  // [5, 3] as one piece costs 5 ^ 3 = 6; as two pieces it costs 5 + 3 = 8, so one piece is better here.
  assert.equal(solve([5, 3], 1), 6)
  assert.equal(solve([5, 3], 2), 8)
})

test('3599 rejects k larger than nums', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

// Independent oracle: try every choice of k - 1 cut positions and sum the XOR of each resulting piece.
function oracle(nums, k) {
  const n = nums.length
  let best = Infinity
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    const cuts = []
    for (let i = 0; i < n - 1; i++) if ((mask >> i) & 1) cuts.push(i + 1)
    if (cuts.length !== k - 1) continue
    const bounds = [0, ...cuts, n]
    let total = 0
    for (let p = 0; p + 1 < bounds.length; p++) {
      let x = 0
      for (let i = bounds[p]; i < bounds[p + 1]; i++) x ^= nums[i]
      total += x
    }
    best = Math.min(best, total)
  }
  return best
}

test('3599 seeded random arrays match a cut enumeration', () => {
  let seed = 3599
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(15))
    const k = 1 + rnd(nums.length)
    assert.equal(solve(nums, k), oracle(nums, k), `${JSON.stringify(nums)} ${k}`)
  }
})
