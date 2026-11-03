import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (rows, cols) => buildTrace(parseInput(JSON.stringify({ rows, cols }))).result

test('3596 a single cell pays its entry cost only', () => {
  assert.equal(solve(1, 1), 1)
})

test('3596 a row and a column', () => {
  // Right then left oscillates, so a third column is unreachable: moves alternate direction.
  assert.equal(solve(1, 2), 3)
  assert.equal(solve(1, 3), -1)
  // Down column 0: entries (0,0)=1, (1,0)=2 gives 3.
  assert.equal(solve(2, 1), 3)
})

test('3596 a two by two grid is unreachable', () => {
  // Right then down needs two forward moves in a row, which the alternation forbids.
  assert.equal(solve(2, 2), -1)
})

test('3596 rejects sizes out of range', () => {
  assert.throws(() => parseInput('{"rows":0,"cols":2}'))
  assert.throws(() => parseInput('{"rows":2,"cols":7}'))
})

// Independent oracle: Bellman-Ford style relaxation over (cell, moves made parity) until nothing improves.
function oracle(rows, cols) {
  const cost = (i, j) => (i + 1) * (j + 1)
  const dist = Array.from({ length: rows }, () => Array.from({ length: cols }, () => [Infinity, Infinity]))
  dist[0][0][0] = cost(0, 0)
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        for (let p = 0; p < 2; p++) {
          const here = dist[i][j][p]
          if (here === Infinity) continue
          const moves = p === 0 ? [[i, j + 1], [i + 1, j]] : [[i, j - 1], [i - 1, j]]
          for (const [r, c] of moves) {
            if (r < 0 || r >= rows || c < 0 || c >= cols) continue
            if (here + cost(r, c) < dist[r][c][1 - p]) {
              dist[r][c][1 - p] = here + cost(r, c)
              changed = true
            }
          }
        }
      }
    }
  }
  const best = Math.min(dist[rows - 1][cols - 1][0], dist[rows - 1][cols - 1][1])
  return best === Infinity ? -1 : best
}

test('3596 every grid up to six by six matches the relaxation oracle', () => {
  for (let rows = 1; rows <= 6; rows++) {
    for (let cols = 1; cols <= 6; cols++) {
      assert.equal(solve(rows, cols), oracle(rows, cols), `${rows}x${cols}`)
    }
  }
})

test('3596 frames keep their pseudocode and python lines in range', () => {
  const run = buildTrace(parseInput('{"rows":3,"cols":3}'))
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= 11)
    assert.ok(f.pythonLine >= 1)
    assert.equal(f.best.length, 3)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
