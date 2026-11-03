import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

// Independent oracle: apply every increment to an actual matrix, then count odd cells.
function bruteOdd(m, n, indices) {
  const grid = Array.from({ length: m }, () => Array(n).fill(0))
  for (const [r, c] of indices) {
    for (let j = 0; j < n; j++) grid[r][j] += 1
    for (let i = 0; i < m; i++) grid[i][c] += 1
  }
  return grid.flat().filter(v => v % 2 === 1).length
}

test('hand-checked small cases', () => {
  assert.equal(buildTrace({ m: 1, n: 1, indices: [[0, 0]] }).result, 0)
  assert.equal(buildTrace({ m: 2, n: 2, indices: [[1, 1], [1, 1]] }).result, 0)
  assert.equal(buildTrace({ m: 3, n: 4, indices: [[0, 1], [2, 3], [2, 0]] }).result, 7)
})

test('random operations agree with matrix simulation', () => {
  let state = 17
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rand(8)
    const n = 1 + rand(8)
    const indices = Array.from({ length: 1 + rand(12) }, () => [rand(m), rand(n)])
    assert.equal(buildTrace({ m, n, indices }).result, bruteOdd(m, n, indices), JSON.stringify({ m, n, indices }))
  }
})

test('every frame points at real pseudocode and Python lines', () => {
  const run = buildTrace({ m: 3, n: 4, indices: [[0, 1], [2, 3], [2, 0]] })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('malformed input is rejected with a message', () => {
  assert.throws(() => parseInput('{"m":0,"n":2,"indices":[[0,0]]}'), /m is/)
  assert.throws(() => parseInput('{"m":2,"n":2,"indices":[[2,0]]}'), /inside/)
  assert.throws(() => parseInput('{"m":2,"n":2,"indices":[]}'), /indices/)
})
