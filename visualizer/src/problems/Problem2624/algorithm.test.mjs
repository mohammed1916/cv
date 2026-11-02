import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, code, parseInput, python } from './algorithm.js'

const solve = (arr, rowsCount, colsCount) => buildTrace({ arr, rowsCount, colsCount }).result

test('2624 worked examples', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5, 6], 2, 3), [[1, 4, 5], [2, 3, 6]])
  assert.deepEqual(solve([1, 2, 3, 4], 1, 4), [[1, 2, 3, 4]])
  assert.deepEqual(solve([1, 2, 3, 4], 4, 1), [[1], [2], [3], [4]])
})

test('2624 size mismatch and empty input give an empty list', () => {
  assert.deepEqual(solve([1, 2, 3], 2, 2), [])
  assert.deepEqual(solve([], 1, 1), [])
  assert.deepEqual(solve([7], 1, 1), [[7]])
})

test('2624 input caps and types are enforced', () => {
  assert.throws(() => parseInput('{"arr":[1],"rowsCount":0,"colsCount":1}'))
  assert.throws(() => parseInput('{"arr":[1],"rowsCount":9,"colsCount":1}'))
  assert.throws(() => parseInput('{"arr":[1.5],"rowsCount":1,"colsCount":1}'))
  assert.throws(() => parseInput('{"arr":[1],"rowsCount":1}'))
})

// Independent oracle: each column c starts at offset c * rows. Even columns read the offsets in order,
// odd columns read them in reverse, so cell (r, c) takes arr[c * rows + (c even ? r : rows - 1 - r)].
function oracle(arr, rows, cols) {
  if (rows * cols !== arr.length) return []
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => arr[c * rows + (c % 2 === 0 ? r : rows - 1 - r)]))
}

test('2624 random inputs match a column-offset oracle and keep every value once', () => {
  let seed = 2624
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(5)
    const cols = 1 + rnd(5)
    const size = rows * cols + (rnd(4) === 0 ? rnd(3) - 1 : 0)
    const arr = Array.from({ length: Math.max(0, size) }, () => rnd(50) - 25)
    const got = solve(arr, rows, cols)
    assert.deepEqual(got, oracle(arr, rows, cols), JSON.stringify({ arr, rows, cols }))
    if (got.length) assert.deepEqual(got.flat().slice().sort((a, b) => a - b), [...arr].sort((a, b) => a - b))
  }
})

test('2624 frame invariants: every line is real and the trace ends with the answer', () => {
  const pythonLines = python.split('\n').length
  const run = buildTrace({ arr: [1, 2, 3, 4, 5, 6], rowsCount: 2, colsCount: 3 })
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pythonLines)
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.view)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).view.answer, run.result)
})
