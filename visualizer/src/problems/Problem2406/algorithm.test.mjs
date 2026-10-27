import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = intervals => buildTrace(parseInput(JSON.stringify({ intervals }))).result

test('2406 examples', () => {
  assert.equal(solve([[5, 10], [6, 8], [1, 5], [2, 3], [1, 10]]), 3)
  assert.equal(solve([[1, 3], [5, 6], [8, 10], [11, 13]]), 1)
})

test('2406 touching intervals overlap at the shared endpoint', () => {
  // [1, 3] and [3, 5] share the point 3, so they need two groups.
  assert.equal(solve([[1, 3], [3, 5]]), 2)
  assert.equal(solve([[1, 3], [4, 5]]), 1)
})

test('2406 rejects a reversed interval and too many intervals', () => {
  assert.throws(() => parseInput('{"intervals":[[4,2]]}'))
  assert.throws(() => parseInput(JSON.stringify({ intervals: Array.from({ length: 11 }, () => [1, 2]) })))
})

// Independent oracle: the answer is the largest number of intervals sharing one integer point.
function oracle(intervals) {
  let best = 0
  for (let x = 1; x <= 30; x++) best = Math.max(best, intervals.filter(([l, r]) => l <= x && x <= r).length)
  return best
}

test('2406 random interval sets match the maximum point coverage', () => {
  let seed = 2406
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const intervals = Array.from({ length: 1 + rnd(10) }, () => { const a = 1 + rnd(30), b = 1 + rnd(30); return [Math.min(a, b), Math.max(a, b)] })
    assert.equal(solve(intervals), oracle(intervals), JSON.stringify(intervals))
  }
})
