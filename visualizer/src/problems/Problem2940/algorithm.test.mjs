import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (heights, queries) => buildTrace(parseInput(JSON.stringify({ heights, queries }))).result
const PY = python.split('\n')

test('2940 worked examples', () => {
  assert.deepEqual(solve([6, 4, 8, 5, 2, 7], [[0, 1], [0, 3], [2, 4], [3, 4], [2, 2]]), [2, 5, -1, 5, 2])
  assert.deepEqual(solve([5, 3, 8, 2, 6, 1, 4, 6], [[0, 7], [3, 5], [5, 2], [3, 7]]), [7, 6, -1, 7])
})

test('2940 frames point at real python lines', () => {
  for (const f of buildTrace({ heights: [3, 1, 4], queries: [[1, 2]] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2940 rejects out-of-range queries', () => {
  assert.throws(() => parseInput('{"heights":[1,2],"queries":[[0,5]]}'))
})

// Oracle: a building j is reachable from both a and b when j >= max(a, b) and it is at least as tall as the taller
// of the two start buildings; the answer is the leftmost such j, found by a plain scan over every index.
function oracle(heights, [x, y]) {
  const a = Math.min(x, y), b = Math.max(x, y)
  for (let j = b; j < heights.length; j++) {
    if (j === b && (a === b || heights[a] < heights[b])) return j
    if (j > b && heights[j] > Math.max(heights[a], heights[b])) return j
    if (j === b && heights[b] > heights[a]) return j
  }
  return -1
}

test('2940 random cases match a plain oracle', () => {
  let seed = 2940
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const heights = Array.from({ length: n }, () => 1 + rnd(9))
    const queries = Array.from({ length: 4 }, () => [rnd(n), rnd(n)])
    assert.deepEqual(solve(heights, queries), queries.map(q => oracle(heights, q)), JSON.stringify({ heights, queries }))
  }
})
