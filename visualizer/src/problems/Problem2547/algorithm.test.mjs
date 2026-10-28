import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('2547 hand-checked examples', () => {
  // Split as [1,2] (cost 2, both values appear once) and [1,2,1,3,3] (cost 2 + 4): total 8.
  assert.equal(solve([1, 2, 1, 2, 1, 3, 3], 2), 8)
  // Two single-value pieces cost 1 each (2 total); one piece [1,1] would cost 1 + 2 = 3.
  assert.equal(solve([1, 1], 1), 2)
  assert.equal(solve([5], 4), 4)
})

test('2547 rejects values outside 0 to 9 and k outside 1 to 10', () => {
  assert.throws(() => parseInput('{"nums":[10],"k":2}'))
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
  assert.throws(() => parseInput('{"nums":[],"k":2}'))
})

// Independent oracle: try every split of the array and price each part by counting its singleton values.
function oracle(nums, k) {
  const n = nums.length
  let best = Infinity
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    const cuts = [0]
    for (let i = 1; i < n; i++) if (mask & (1 << (i - 1))) cuts.push(i)
    cuts.push(n)
    let total = 0
    for (let c = 1; c < cuts.length; c++) {
      const part = nums.slice(cuts[c - 1], cuts[c])
      const freq = new Map()
      for (const v of part) freq.set(v, (freq.get(v) || 0) + 1)
      let singles = 0
      for (const v of part) if (freq.get(v) === 1) singles++
      total += k + (part.length - singles)
    }
    best = Math.min(best, total)
  }
  return best
}

test('2547 random cases match the split oracle', () => {
  let seed = 2547
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(9) + 1
    const nums = Array.from({ length: n }, () => rnd(10))
    const k = rnd(10) + 1
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
