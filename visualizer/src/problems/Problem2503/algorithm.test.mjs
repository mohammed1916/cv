import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2503 official examples', () => {
  assert.deepEqual(solve({ grid: [[1, 2, 3], [2, 5, 7], [3, 5, 1]], queries: [5, 6, 2] }), [5, 8, 1])
  assert.deepEqual(solve({ grid: [[5, 2, 1], [1, 1, 2]], queries: [3] }), [0])
})

test('2503 a query equal to the start value collects nothing', () => {
  assert.deepEqual(solve({ grid: [[4, 0], [0, 0]], queries: [4, 5] }), [0, 4])
})

test('2503 rejects a row of the wrong length', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]],"queries":[2]}'))
})

// Independent oracle: for each query, flood-fill from the top-left cell through cells below the query value.
function oracle({ grid, queries }) {
  const m = grid.length
  const n = grid[0].length
  return queries.map(q => {
    if (grid[0][0] >= q) return 0
    const seen = new Set(['0,0'])
    const stack = [[0, 0]]
    while (stack.length) {
      const [r, c] = stack.pop()
      for (const [nr, nc] of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]]) {
        if (nr < 0 || nc < 0 || nr >= m || nc >= n || grid[nr][nc] >= q || seen.has(`${nr},${nc}`)) continue
        seen.add(`${nr},${nc}`)
        stack.push([nr, nc])
      }
    }
    return seen.size
  })
}

test('2503 random grids match a per-query flood-fill oracle', () => {
  let seed = 2503
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 2 + rnd(3)
    const n = 2 + rnd(3)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(10)))
    const queries = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(10))
    const input = { grid, queries }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
