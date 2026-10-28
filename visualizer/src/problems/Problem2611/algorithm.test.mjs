import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2611 official examples', () => {
  assert.equal(solve({ reward1: [1, 1, 3, 4], reward2: [4, 4, 1, 1], k: 2 }), 15)
  assert.equal(solve({ reward1: [1, 1], reward2: [3, 4], k: 1 }), 5)
})

test('2611 k of zero gives every type to the second mouse', () => {
  assert.equal(solve({ reward1: [5, 1], reward2: [2, 9], k: 0 }), 11)
})

test('2611 rejects mismatched arrays', () => {
  assert.throws(() => parseInput(JSON.stringify({ reward1: [1], reward2: [1, 2], k: 0 })))
})

// Independent oracle: try every subset of k cheese types for the first mouse.
function oracle({ reward1, reward2, k }) {
  const n = reward1.length
  let best = -Infinity
  for (let mask = 0; mask < (1 << n); mask++) {
    let bits = 0
    let sum = 0
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) { bits++; sum += reward1[i] } else sum += reward2[i]
    }
    if (bits === k) best = Math.max(best, sum)
  }
  return best
}

test('2611 random inputs match a subset-enumeration oracle', () => {
  let seed = 2611
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(7)
    const input = {
      reward1: Array.from({ length: n }, () => 1 + rnd(20)),
      reward2: Array.from({ length: n }, () => 1 + rnd(20)),
      k: rnd(n + 1),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
