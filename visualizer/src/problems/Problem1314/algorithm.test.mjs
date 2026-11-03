import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code } from './algorithm.js'

const oracle = (mat, k) => mat.map((row, i) => row.map((_, j) => {
  let s = 0
  for (let r = Math.max(0, i - k); r <= Math.min(mat.length - 1, i + k); r++)
    for (let c = Math.max(0, j - k); c <= Math.min(row.length - 1, j + k); c++) s += mat[r][c]
  return s
}))

test('hand-checked samples', () => {
  assert.deepEqual(buildTrace({ mat: [[1, 1, 0], [0, 2, 1]], k: 1 }).result, [[4, 5, 4], [4, 5, 4]])
  assert.deepEqual(buildTrace({ mat: [[3, 0], [1, 4]], k: 0 }).result, [[3, 0], [1, 4]])
})

test('random grids agree with the direct double loop', () => {
  let state = 13
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const rows = 1 + rand(5), cols = 1 + rand(5)
    const mat = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rand(10)))
    const k = rand(5)
    assert.deepEqual(buildTrace({ mat, k }).result, oracle(mat, k), JSON.stringify({ mat, k }))
  }
})

test('every frame points at a real code line and Python line', () => {
  for (const frame of buildTrace({ mat: [[1, 2], [3, 4]], k: 1 }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
  }
})

test('rejects bad shapes and values', () => {
  assert.throws(() => parseInput('{"mat":[[1,2],[3]],"k":1}'), /rectangle/)
  assert.throws(() => parseInput('{"mat":[[10]],"k":1}'), /0 to 9/)
  assert.throws(() => parseInput('{"mat":[[1]],"k":5}'), /k is/)
})
