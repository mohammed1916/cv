import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3578 official examples', () => {
  assert.equal(solve({ nums: [9, 4, 1, 3, 7], k: 4 }), 6)
})

test('3578 with k = 0 only equal neighbours can share a part', () => {
  // All values differ, so every number is its own part: one partition.
  assert.equal(solve({ nums: [1, 2, 3, 4], k: 0 }), 1)
  // Equal values may share a part: [2,2] gives two partitions.
  assert.equal(solve({ nums: [2, 2], k: 0 }), 2)
})

test('3578 rejects a value outside the visual range', () => {
  assert.throws(() => parseInput('{"nums":[0],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":21}'))
})

// Independent oracle: try every set of cut points and check each part's max minus min directly.
function oracle({ nums, k }) {
  const n = nums.length
  let count = 0
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    let ok = true
    let start = 0
    for (let end = 0; end < n; end++) {
      if (end === n - 1 || (mask >> end) & 1) {
        const part = nums.slice(start, end + 1)
        if (Math.max(...part) - Math.min(...part) > k) ok = false
        start = end + 1
      }
    }
    if (ok) count++
  }
  return count % 1000000007
}

test('3578 random inputs match a cut-point oracle', () => {
  let seed = 3578
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(12))
    const input = { nums, k: rnd(8) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
