import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (start, target) => buildTrace({ start, target }).result

function checkFrames(run) {
  const lines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, 'activeLine in range')
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= lines, 'pythonLine in range')
    assert.equal(typeof f.message, 'string')
  }
}

// Oracle: walk over (square, parity) states on the 8 by 8 board and ask whether target is reached with parity 0.
function oracle(start, target) {
  const moves = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]
  const seen = new Set()
  const queue = [[start[0], start[1], 0]]
  seen.add(`${start[0]},${start[1]},0`)
  while (queue.length) {
    const [r, c, p] = queue.shift()
    if (r === target[0] && c === target[1] && p === 0) return true
    for (const [dr, dc] of moves) {
      const nr = r + dr, nc = c + dc
      if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue
      const key = `${nr},${nc},${1 - p}`
      if (!seen.has(key)) { seen.add(key); queue.push([nr, nc, 1 - p]) }
    }
  }
  return false
}

test('3996 authored examples', () => {
  assert.equal(solve([0, 0], [2, 1]), false)
  assert.equal(solve([0, 0], [1, 1]), true)
  assert.equal(solve([4, 4], [4, 4]), true)
})

test('3996 corners and the opposite corner', () => {
  assert.equal(solve([0, 0], [7, 7]), true)
  assert.equal(solve([0, 0], [7, 6]), false)
})

test('3996 rejects squares off the board', () => {
  assert.throws(() => parseInput('{"start":[8,0],"target":[0,0]}'))
  assert.throws(() => parseInput('{"start":[0,0],"target":[0]}'))
})

test('3996 every pair of squares matches the walk oracle', () => {
  for (let a = 0; a < 64; a++) {
    for (let b = 0; b < 64; b++) {
      const start = [Math.floor(a / 8), a % 8]
      const target = [Math.floor(b / 8), b % 8]
      assert.equal(solve(start, target), oracle(start, target), JSON.stringify({ start, target }))
    }
  }
  checkFrames(buildTrace({ start: [3, 3], target: [5, 0] }))
})
