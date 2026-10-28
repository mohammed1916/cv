import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('2732 official examples', () => {
  assert.deepEqual(solve([[0, 1, 1, 0], [0, 0, 0, 1], [1, 1, 1, 1]]), [0, 1])
  assert.deepEqual(solve([[0]]), [0])
  assert.deepEqual(solve([[1, 1, 1], [1, 1, 1]]), [])
})

test('2732 edge case: two rows with no shared column', () => {
  assert.deepEqual(solve([[1, 0], [0, 1]]), [0, 1])
})

test('2732 rejects a value other than 0 or 1, a ragged grid, and an empty grid', () => {
  assert.throws(() => parseInput('{"grid":[[2]]}'))
  assert.throws(() => parseInput('{"grid":[[1,0],[1]]}'))
  assert.throws(() => parseInput('{"grid":[]}'))
})

// Independent oracle: try every subset of rows, in order of size and then lexicographic order, and return
// the first one whose column sums are at most floor(size / 2). This does not assume subsets of size two suffice.
function oracle(grid) {
  const m = grid.length
  const n = grid[0].length
  const isGood = rows => {
    for (let c = 0; c < n; c++) {
      let sum = 0
      for (const r of rows) sum += grid[r][c]
      if (sum > Math.floor(rows.length / 2)) return false
    }
    return true
  }
  for (let size = 1; size <= m; size++) {
    const combo = []
    const walk = start => {
      if (combo.length === size) return isGood(combo) ? [...combo] : null
      for (let r = start; r < m; r++) {
        combo.push(r)
        const found = walk(r + 1)
        combo.pop()
        if (found) return found
      }
      return null
    }
    const found = walk(0)
    if (found) return found
  }
  return []
}

test('2732 random grids match an exhaustive subset search', () => {
  let seed = 2732
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const m = 1 + rnd(6)
    const n = 1 + rnd(5)
    const grid = []
    for (let i = 0; i < m; i++) {
      const row = []
      for (let j = 0; j < n; j++) row.push(rnd(3) === 0 ? 1 : 0)
      grid.push(row)
    }
    assert.deepEqual(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
