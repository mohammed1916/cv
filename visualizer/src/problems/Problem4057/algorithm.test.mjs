import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = intervals => buildTrace({ intervals }).result

test('4057 official examples', () => {
  assert.equal(solve([[1, 2], [2, 3], [3, 4]]), 2)
  assert.equal(solve([[1, 5], [2, 4], [3, 6]]), 3)
  assert.equal(solve([[1, 2], [3, 4], [5, 6]]), 0)
})

test('4057 large endpoints need no special handling', () => {
  assert.equal(solve([[0, 1000000000], [1000000000, 1000000000], [1, 2]]), 2)
})

test('4057 rejects an end above 1000000000', () => {
  assert.throws(() => parseInput('{"intervals":[[1,1000000001],[2,3]]}'))
})

// Independent oracle: compare every pair of intervals directly.
function oracle(intervals) {
  let count = 0
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      const [s1, e1] = intervals[i]
      const [s2, e2] = intervals[j]
      if (Math.max(s1, s2) <= Math.min(e1, e2)) count++
    }
  }
  return count
}

test('4057 random intervals match a pairwise oracle', () => {
  let seed = 4057
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const intervals = Array.from({ length: 2 + rnd(9) }, () => {
      const s = rnd(40)
      return [s, s + rnd(12)]
    })
    assert.equal(solve(intervals), oracle(intervals), JSON.stringify(intervals))
  }
})
