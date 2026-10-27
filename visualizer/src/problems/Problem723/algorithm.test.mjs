import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = board => buildTrace(board).result

test('723 a single run empties the row', () => {
  assert.deepEqual(solve([[1, 1, 1]]), [[0, 0, 0]])
})

test('723 pairs are not crushed', () => {
  assert.deepEqual(solve([[1, 2, 3]]), [[1, 2, 3]])
})

test('723 fallen candies can form a new run', () => {
  // Crushing row 0 leaves 2 above 3 in column 3; nothing else changes.
  assert.deepEqual(solve([[1, 1, 1, 2], [2, 2, 2, 3]]), [[0, 0, 0, 2], [0, 0, 0, 3]])
})

test('723 rejects non-rectangular boards', () => {
  assert.throws(() => parseInput('[[1,2],[1]]'))
})

// Independent oracle: write the rule as explicit triples and rebuild each column from scratch.
function oracle(start) {
  let board = start.map(row => [...row])
  const rows = board.length, cols = board[0].length
  for (;;) {
    const hit = Array.from({ length: rows }, () => Array(cols).fill(false))
    let any = false
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const triples = [
          c + 2 < cols && board[r][c] && board[r][c] === board[r][c + 1] && board[r][c] === board[r][c + 2] && [[r, c], [r, c + 1], [r, c + 2]],
          r + 2 < rows && board[r][c] && board[r][c] === board[r + 1][c] && board[r][c] === board[r + 2][c] && [[r, c], [r + 1, c], [r + 2, c]],
        ]
        for (const triple of triples) {
          if (!triple) continue
          any = true
          for (const [y, x] of triple) hit[y][x] = true
        }
      }
    }
    if (!any) return board
    board = board.map((row, r) => row.map((v, c) => (hit[r][c] ? 0 : v)))
    for (let c = 0; c < cols; c++) {
      const kept = []
      for (let r = 0; r < rows; r++) if (board[r][c] !== 0) kept.push(board[r][c])
      const column = [...Array(rows - kept.length).fill(0), ...kept]
      for (let r = 0; r < rows; r++) board[r][c] = column[r]
    }
  }
}

test('723 random boards match an oracle', () => {
  let seed = 19
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(6), cols = 1 + rnd(6)
    const board = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(4)))
    assert.deepEqual(solve(board), oracle(board), JSON.stringify(board))
  }
})
