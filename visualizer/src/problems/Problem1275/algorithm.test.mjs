import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = moves => buildTrace({ moves }).result

test('1275 sample games give the expected outcomes', () => {
  // X O X / X O O / O X X: no line is complete after all nine marks.
  assert.equal(solve([[0, 0], [0, 1], [0, 2], [1, 1], [1, 0], [1, 2], [2, 1], [2, 0], [2, 2]]), 'Draw')
  assert.equal(solve([[0, 0], [2, 0], [1, 1], [2, 1], [2, 2]]), 'A')
  assert.equal(solve([[0, 0], [0, 1], [2, 2], [1, 1], [2, 0], [2, 1]]), 'B')
  assert.equal(solve([[0, 0], [1, 1]]), 'Pending')
})

test('1275 diagonal and anti-diagonal wins are detected', () => {
  assert.equal(solve([[0, 2], [0, 0], [1, 1], [0, 1], [2, 0]]), 'A')
  // A completes column 0 with its seventh move, even though B already holds the lower-right diagonal cell.
  assert.equal(solve([[0, 0], [0, 2], [1, 1], [0, 1], [1, 0], [2, 2], [2, 0]]), 'A')
})

test('1275 rejects malformed or continued games', () => {
  assert.throws(() => parseInput('{"moves":[[0,0],[0,0]]}'), /twice/)
  assert.throws(() => parseInput('{"moves":[[3,0]]}'), /0 to 2/)
  assert.throws(() => parseInput('{"moves":[[0,0],[1,0],[0,1],[1,1],[0,2],[1,2]]}'), /follow/)
  assert.throws(() => parseInput('{"moves":[]}'), /1 to 9/)
})

// Independent oracle: replay all moves and check every line of the board after each move.
test('1275 random legal games match a full-board oracle', () => {
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
  for (let t = 0; t < 300; t++) {
    const free = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    const cells = []
    const length = 1 + rnd(9)
    while (cells.length < length) cells.push(free.splice(rnd(free.length), 1)[0])
    const board = Array(9).fill('')
    let expected = null
    for (let i = 0; i < cells.length && expected === null; i++) {
      board[cells[i]] = i % 2 === 0 ? 'A' : 'B'
      for (const line of lines) {
        const [a, b, c] = line.map(k => board[k])
        if (a && a === b && b === c) { expected = a; cells.length = i + 1; break }
      }
    }
    if (expected === null) expected = cells.length === 9 ? 'Draw' : 'Pending'
    const moves = cells.map(k => [Math.floor(k / 3), k % 3])
    const input = JSON.stringify({ moves })
    parseInput(input)
    assert.equal(solve(moves), expected, input)
  }
})
