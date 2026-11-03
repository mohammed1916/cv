import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

// Independent oracle: rotate the flattened cells one position to the right, k times.
function oracle(grid, k) {
  const m = grid.length
  const n = grid[0].length
  let flat = grid.flat()
  for (let step = 0; step < k; step++) flat = [flat[flat.length - 1], ...flat.slice(0, -1)]
  return Array.from({ length: m }, (_, r) => flat.slice(r * n, r * n + n))
}

test('my sample: 3 by 2 grid shifted by 2', () => {
  assert.deepEqual(buildTrace({ grid: [[1, 2], [3, 4], [5, 6]], k: 2 }).result, [[5, 6], [1, 2], [3, 4]])
})

test('shifting by the cell count leaves the grid unchanged', () => {
  assert.deepEqual(buildTrace({ grid: [[7, 8], [9, 1]], k: 4 }).result, [[7, 8], [9, 1]])
})

test('random grids agree with repeated one-cell rotation', () => {
  let state = 11
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rand(5)
    const n = 1 + rand(5)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rand(100)))
    const k = rand(40)
    assert.deepEqual(buildTrace({ grid, k }).result, oracle(grid, k), JSON.stringify({ grid, k }))
  }
})

test('each cell is filled exactly once and every frame points at real lines', () => {
  const run = buildTrace({ grid: [[1, 2, 3], [4, 5, 6]], k: 4 })
  const placements = run.frames.filter(f => f.phase === 'place')
  assert.equal(placements.length, 6)
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('malformed input is rejected', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]],"k":1}'), /same length/)
  assert.throws(() => parseInput('{"grid":[[1,2]],"k":-1}'), /k is/)
  assert.throws(() => parseInput('{"grid":[[100]],"k":0}'), /0 to 99/)
})
