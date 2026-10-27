import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify(grid))).result

test('1568 official examples and small shapes', () => {
  assert.equal(solve([[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]), 2)
  assert.equal(solve([[1, 1], [1, 1]]), 2)
  assert.equal(solve([[1]]), 1)
  assert.equal(solve([[1, 0, 1]]), 0)
  assert.equal(solve([[0, 0]]), 0)
})

test('1568 a path has a cut cell', () => {
  // The cell at row 0 column 1 is the only link between (0,0) and the rest.
  assert.equal(solve([[1, 1, 0], [0, 1, 0], [0, 1, 1]]), 1)
})

test('1568 rejects ragged rows', () => {
  assert.throws(() => parseInput('[[1,1],[1]]'))
})

function components(grid) {
  const R = grid.length
  const C = grid[0].length
  const seen = new Set()
  let count = 0
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] !== 1 || seen.has(`${r},${c}`)) continue
      count++
      const queue = [[r, c]]
      seen.add(`${r},${c}`)
      while (queue.length) {
        const [a, b] = queue.shift()
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const na = a + dr
          const nb = b + dc
          if (na < 0 || nb < 0 || na >= R || nb >= C || grid[na][nb] !== 1 || seen.has(`${na},${nb}`)) continue
          seen.add(`${na},${nb}`)
          queue.push([na, nb])
        }
      }
    }
  }
  return count
}

// Independent oracle: try the answer 0, then removing each single land cell, and otherwise 2.
function oracle(grid) {
  if (components(grid) !== 1) return 0
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] !== 1) continue
      const copy = grid.map(row => [...row])
      copy[r][c] = 0
      if (components(copy) !== 1) return 1
    }
  }
  return 2
}

test('1568 random grids match a remove-one-cell oracle', () => {
  let seed = 1568
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const R = 1 + rnd(5)
    const C = 1 + rnd(5)
    const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => (rnd(10) < 6 ? 1 : 0)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
