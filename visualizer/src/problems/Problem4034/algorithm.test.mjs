import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (source, target) => buildTrace({ source, target }).result

test('4034 one move along a diagonal and two moves across the board', () => {
  assert.equal(solve([1, 1], [8, 8]), 1)
  assert.equal(solve([3, 2], [6, 7]), 2)
  assert.equal(solve([1, 1], [2, 3]), -1)
  assert.equal(solve([4, 4], [4, 5]), -1)
  assert.equal(solve([4, 4], [1, 3]), 2)
})

test('4034 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace({ source: [3, 2], target: [6, 7] })
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.phase)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, frame.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('4034 rejects bad squares', () => {
  assert.throws(() => parseInput('{"source":[0,1],"target":[2,2]}'))
  assert.throws(() => parseInput('{"source":[1,1],"target":[1,1]}'))
  assert.throws(() => parseInput('{"source":[1,1]}'))
})

// Independent oracle: on an 8 by 8 empty board a bishop needs 0 moves (same square), 1 move (same diagonal),
// 2 moves (same colour, otherwise) or cannot reach a square of the other colour.
function oracle([r1, c1], [r2, c2]) {
  if (r1 === r2 && c1 === c2) return 0
  if (Math.abs(r1 - r2) === Math.abs(c1 - c2)) return 1
  if ((r1 + c1 - (r2 + c2)) % 2 !== 0) return -1
  return 2
}

test('4034 every square pair matches the colour and diagonal oracle', () => {
  for (let r1 = 1; r1 <= 8; r1++) for (let c1 = 1; c1 <= 8; c1++) {
    for (let r2 = 1; r2 <= 8; r2++) for (let c2 = 1; c2 <= 8; c2++) {
      if (r1 === r2 && c1 === c2) continue
      assert.equal(solve([r1, c1], [r2, c2]), oracle([r1, c1], [r2, c2]), `${r1},${c1} to ${r2},${c2}`)
    }
  }
})
