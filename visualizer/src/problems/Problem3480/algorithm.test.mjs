import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, conflictingPairs) => buildTrace({ n, conflictingPairs }).result

test('3480 hand-checked cases', () => {
  assert.equal(solve(4, [[2, 3], [1, 4]]), 9)
  // Removing [1,2] leaves (2,3): bad subarrays are [2,3] and [1,2,3], so 6 - 2 = 4.
  // Removing [2,3] leaves (1,2): bad subarrays are [1,2] and [1,2,3], also 4.
  assert.equal(solve(3, [[1, 2], [2, 3]]), 4)
})

test('3480 the final trace frame reports the result', () => {
  const trace = buildTrace({ n: 3, conflictingPairs: [[1, 2], [2, 3]] })
  assert.equal(trace.frames.at(-1).total, trace.result)
})

test('3480 rejects malformed input', () => {
  assert.throws(() => parseInput('{"n":3,"conflictingPairs":[[2,2]]}'))
  assert.throws(() => parseInput('{"n":3,"conflictingPairs":[[1,4]]}'))
  assert.throws(() => parseInput('{"n":1,"conflictingPairs":[[1,2]]}'))
})

// Independent oracle: enumerate every subarray and test each remaining pair directly.
function oracle(n, pairs) {
  let best = 0
  for (let skip = 0; skip < pairs.length; skip++) {
    let count = 0
    for (let l = 1; l <= n; l++) {
      for (let r = l; r <= n; r++) {
        const bad = pairs.some(([a, b], index) => index !== skip && a >= l && b <= r)
        if (!bad) count++
      }
    }
    best = Math.max(best, count)
  }
  return best
}

test('3480 agrees with a brute-force oracle on random inputs', () => {
  let s = 3480
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
  const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1))
  for (let t = 0; t < 200; t++) {
    const n = int(2, 8)
    const count = int(1, 2 * n)
    const pairs = Array.from({ length: count }, () => {
      let a = int(1, n)
      let b = int(1, n)
      while (b === a) b = int(1, n)
      return [a, b]
    })
    const normalized = pairs.map(([a, b]) => [Math.min(a, b), Math.max(a, b)])
    assert.equal(solve(n, pairs), oracle(n, normalized))
  }
})
