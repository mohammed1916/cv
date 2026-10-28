import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3068 official examples', () => {
  assert.equal(solve({ nums: [1, 2, 1], k: 3 }), 6)
  assert.equal(solve({ nums: [2, 3], k: 7 }), 9)
  assert.equal(solve({ nums: [7, 7, 7, 7, 7, 7], k: 3 }), 42)
})

test('3068 k outside 1 to 10 is rejected', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
})

// Independent oracle: try every subset of nodes to flip. A flip on a connected tree reaches any
// subset with an even number of nodes, so only even-size subsets are considered.
function oracle({ nums, k }) {
  const n = nums.length
  let best = -Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    let bits = 0
    let sum = 0
    for (let i = 0; i < n; i++) {
      if ((mask >> i) & 1) {
        bits++
        sum += nums[i] ^ k
      } else {
        sum += nums[i]
      }
    }
    if (bits % 2 === 0 && sum > best) best = sum
  }
  return best
}

test('3068 random inputs match the subset oracle', () => {
  let seed = 3068
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const input = { nums: Array.from({ length: 2 + rnd(6) }, () => rnd(21)), k: 1 + rnd(8) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
