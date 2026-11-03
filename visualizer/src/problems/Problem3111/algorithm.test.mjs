import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (points, w) => buildTrace({ points, w }).result

test('3111 worked cases on invented data', () => {
  assert.equal(solve([[1, 3], [2, 2], [5, 9], [6, 1], [9, 4]], 2), 3)
  assert.equal(solve([[4, 0], [4, 7], [4, 2]], 0), 1)
  assert.equal(solve([[0, 0], [1, 1], [2, 2]], 0), 3)
})

// Oracle: try every subset of start positions taken from the x values.
function oracle(points, w) {
  const xs = [...new Set(points.map(([x]) => x))]
  let best = Infinity
  for (let mask = 1; mask < 1 << xs.length; mask++) {
    const starts = xs.filter((_, i) => mask & (1 << i))
    if (xs.every(x => starts.some(s => s <= x && x <= s + w))) best = Math.min(best, starts.length)
  }
  return best
}

test('3111 matches brute force on small invented sets', () => {
  const samples = [[[1, 2], [3, 9], [4, 0], [10, 5]], [[0, 1], [2, 1], [3, 1], [7, 1]], [[5, 5], [6, 6], [8, 8], [9, 1]]]
  for (const pts of samples) for (let w = 0; w <= 4; w++) assert.equal(solve(pts, w), oracle(pts, w))
})

test('3111 rejects malformed input', () => {
  assert.throws(() => parseInput('{"points":[[1]],"w":1}'))
  assert.throws(() => parseInput('{"points":[[1,2]],"w":-1}'))
})
