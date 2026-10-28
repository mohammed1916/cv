import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, and_values) => buildTrace({ nums, and_values }).result

test('3117 official examples', () => {
  assert.equal(solve([1, 4, 3, 3, 2], [0, 3, 3, 2]), 12)
  assert.equal(solve([2, 3, 5, 7, 7, 7, 5], [0, 7, 5]), 17)
  assert.equal(solve([1, 2, 3, 4], [2]), -1)
})

test('3117 a single piece costs its last element', () => {
  assert.equal(solve([6, 4], [4]), 4)
})

test('3117 rejects more pieces than elements', () => {
  assert.throws(() => parseInput('{"nums":[1],"and_values":[1,1]}'))
})

// Independent oracle: exhaustive search over every way to cut nums into len(and_values) contiguous
// pieces, with no memo table.
function oracle(nums, andValues) {
  const n = nums.length
  const best = { value: Infinity }
  const go = (start, piece, total) => {
    if (piece === andValues.length) {
      if (start === n) best.value = Math.min(best.value, total)
      return
    }
    let acc = -1
    for (let end = start; end < n; end++) {
      acc &= nums[end]
      if (acc === andValues[piece]) go(end + 1, piece + 1, total + nums[end])
    }
  }
  go(0, 0, 0)
  return best.value === Infinity ? -1 : best.value
}

test('3117 random arrays match an exhaustive partition oracle', () => {
  let seed = 3117
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => rnd(16))
    const m = 1 + rnd(Math.min(n, 4))
    // Half the cases use the ANDs of a real partition, so that feasible splits are common.
    const andValues = Array.from({ length: m }, () => rnd(16))
    if (rnd(2) === 0) {
      let start = 0
      for (let p = 0; p < m; p++) {
        const end = p === m - 1 ? n : Math.min(n, start + 1 + rnd(n))
        if (end <= start) { andValues[p] = nums[start] } else {
          let acc = -1
          for (let x = start; x < end; x++) acc &= nums[x]
          andValues[p] = acc
        }
        start = end
      }
    }
    assert.equal(solve(nums, andValues), oracle(nums, andValues), JSON.stringify({ nums, andValues }))
  }
})
