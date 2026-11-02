import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = points => buildTrace(points).result

test('3623 worked examples', () => {
  assert.equal(solve([[1, 0], [2, 0], [3, 0], [2, 2], [3, 2]]), 3)
  assert.equal(solve([[0, 0], [1, 0], [0, 1], [1, 1]]), 1)
})

test('3623 edge cases: no parallel pairs and collinear heights', () => {
  assert.equal(solve([[0, 0], [1, 1], [2, 2], [3, 3]]), 0)
  assert.equal(solve([[0, 5], [1, 5], [2, 5], [3, 5]]), 0)
  assert.equal(solve([[0, 0], [1, 0], [0, 1], [1, 1], [5, 1]]), 3)
})

test('3623 rejects duplicate or malformed points', () => {
  assert.throws(() => parseInput('[[0,0],[0,0],[1,1],[2,2]]'))
  assert.throws(() => parseInput('[[0,0],[1,1],[2,2]]'))
  assert.throws(() => parseInput('[[0,0,1],[1,1],[2,2],[3,3]]'))
})

// Independent oracle: test every 4-point subset for two horizontal sides at different heights.
function oracle(points) {
  let count = 0
  const n = points.length
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) for (let d = c + 1; d < n; d++) {
    const ys = [points[a][1], points[b][1], points[c][1], points[d][1]].sort((p, q) => p - q)
    if (ys[0] === ys[1] && ys[2] === ys[3] && ys[1] !== ys[2]) count++
  }
  return count
}

test('3623 random inputs match a four-point oracle', () => {
  let seed = 3623
  const next = (n) => { seed = (seed * 1103515245 + 12345) % 2147483648; return Math.floor(seed / 65536) % n }
  for (let t = 0; t < 300; t++) {
    const set = new Set()
    const size = 4 + next(5)
    while (set.size < size) set.add(`${next(4)},${next(4)}`)
    const points = [...set].map(key => key.split(',').map(Number))
    assert.equal(solve(points), oracle(points) % 1000000007)
  }
})
