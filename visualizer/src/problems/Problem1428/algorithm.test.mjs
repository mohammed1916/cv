import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = matrix => buildTrace({ matrix }).result
const pythonLines = python.trim().split('\n').length

test('1428 authored presets give the expected columns', () => {
  assert.equal(solve(parseInput('[[0,0,0,0,1],[0,0,1,1,1],[0,0,0,1,1]]').matrix), 2)
  assert.equal(solve(parseInput('[[0,0,0,0,0,0],[0,0,0,0,1,1],[0,0,0,1,1,1],[0,1,1,1,1,1]]').matrix), 1)
  assert.equal(solve(parseInput('[[0,0,0],[0,0,0]]').matrix), -1)
})

test('1428 edge cases: single cells and full rows', () => {
  assert.equal(solve([[1]]), 0)
  assert.equal(solve([[0]]), -1)
  assert.equal(solve([[1, 1, 1]]), 0)
  assert.equal(solve([[0, 0, 1]]), 2)
  assert.equal(solve([[0], [0], [1]]), 0)
})

test('1428 rejects malformed matrices', () => {
  assert.throws(() => parseInput('[[1,0]]'))
  assert.throws(() => parseInput('[[0,1],[0]]'))
  assert.throws(() => parseInput('[[0,2]]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[[0,0,0,0,0,0,0,0,0]]'))
})

// Independent oracle: scan every column from the left and stop at the first column holding a one.
function oracle(matrix) {
  for (let c = 0; c < matrix[0].length; c++) {
    for (let r = 0; r < matrix.length; r++) if (matrix[r][c] === 1) return c
  }
  return -1
}

test('1428 random sorted matrices match a column-scan oracle', () => {
  let seed = 1428
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const rows = 1 + rnd(6)
    const cols = 1 + rnd(6)
    const matrix = Array.from({ length: rows }, () => {
      const start = rnd(cols + 1)
      return Array.from({ length: cols }, (_, c) => (c >= start ? 1 : 0))
    })
    assert.equal(solve(matrix), oracle(matrix), JSON.stringify(matrix))
  }
})

test('1428 frames satisfy the trace invariants', () => {
  let seed = 7
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const rows = 1 + rnd(8)
    const cols = 1 + rnd(8)
    const matrix = Array.from({ length: rows }, () => {
      const start = rnd(cols + 1)
      return Array.from({ length: cols }, (_, c) => (c >= start ? 1 : 0))
    })
    const run = buildTrace({ matrix })
    const { frames } = run
    assert.equal(frames[frames.length - 1].phase, 'done')
    assert.equal(frames[frames.length - 1].best, run.result)
    assert.equal(run.result, oracle(matrix), JSON.stringify(matrix))
    const probeFrames = frames.filter(f => f.phase === 'probe')
    assert.ok(probeFrames.length <= rows + cols, 'get calls stay within rows + cols')
    const keys = new Set(probeFrames.map(f => `${f.row},${f.col}`))
    assert.equal(keys.size, probeFrames.length, 'no cell is read twice')
    for (const f of frames) {
      assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine ${f.activeLine}`)
      assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pythonLines, `pythonLine ${f.pythonLine}`)
      assert.equal(typeof f.message, 'string')
      assert.ok(f.message.length > 0)
    }
    for (const p of frames[frames.length - 1].probes) assert.equal(p.value, matrix[p.row][p.col])
  }
})
