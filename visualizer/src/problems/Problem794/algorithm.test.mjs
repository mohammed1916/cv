import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, LINES } from './algorithm.js'

// Oracle: enumerate every board reachable by actually playing the game (stop when someone wins).
const wins = (c, p) => LINES.some(l => l.every(i => c[i] === p))
const reachable = new Set()
const play = (c, turn) => {
  reachable.add(c.join(''))
  if (wins(c, 'X') || wins(c, 'O')) return
  for (let i = 0; i < 9; i++) if (c[i] === ' ') { const n = [...c]; n[i] = turn; play(n, turn === 'X' ? 'O' : 'X') }
}
play(new Array(9).fill(' '), 'X')
test('official examples', () => {
  assert.equal(buildTrace(['O  ', '   ', '   ']).result, false)
  assert.equal(buildTrace(['XOX', ' X ', '   ']).result, false)
  assert.equal(buildTrace(['XOX', 'O O', 'XOX']).result, true)
})
test('matches game-simulation oracle on all 3^9 boards', () => {
  const chars = ' XO'
  for (let m = 0; m < 3 ** 9; m++) {
    let t = m; const cells = []
    for (let i = 0; i < 9; i++) { cells.push(chars[t % 3]); t = Math.floor(t / 3) }
    const board = [0, 3, 6].map(r => cells.slice(r, r + 3).join(''))
    const run = buildTrace(board)
    assert.equal(run.result, reachable.has(cells.join('')), board.join('|'))
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('["XOX","O O"]'))
  assert.throws(() => parseInput('["XOX","O O","XOZ"]'))
  assert.throws(() => parseInput('"XOX"'))
})
