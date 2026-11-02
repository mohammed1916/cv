import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const run = (rectangle, ops) => buildTrace({ rectangle, ops }).result

test('1476 worked example', () => {
  const rectangle = [[1, 2, 1], [4, 3, 4], [3, 2, 1], [1, 1, 1]]
  const ops = [['getValue', 0, 2], ['updateSubrectangle', 0, 0, 3, 2, 5], ['getValue', 0, 2], ['getValue', 3, 1], ['updateSubrectangle', 3, 0, 3, 2, 10], ['getValue', 3, 1], ['getValue', 0, 2]]
  assert.deepEqual(run(rectangle, ops), [1, null, 5, 5, null, 10, 5])
})

test('1476 newest covering update wins and misses fall back to the base', () => {
  assert.deepEqual(run([[1, 1], [1, 1]], [['updateSubrectangle', 0, 0, 1, 1, 2], ['updateSubrectangle', 0, 0, 0, 0, 3], ['getValue', 0, 0], ['getValue', 1, 1]]), [null, null, 3, 2])
  assert.deepEqual(run([[7, 8], [9, 10]], [['getValue', 1, 0], ['getValue', 0, 1]]), [9, 8])
})

test('1476 rejects an inverted or out-of-range update', () => {
  assert.throws(() => parseInput('{"rectangle":[[1]],"ops":[["updateSubrectangle",0,0,0,0,"x"]]}'))
  assert.throws(() => parseInput('{"rectangle":[[1,2]],"ops":[["updateSubrectangle",0,1,0,0,5]]}'))
  assert.throws(() => parseInput('{"rectangle":[[1,2]],"ops":[["getValue",0,2]]}'))
})

// Oracle: apply every update to a full copy of the grid, then read the cell.
test('1476 random operations match a direct-grid oracle', () => {
  let seed = 1476
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(4), cols = 1 + rnd(4)
    const rectangle = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 1 + rnd(9)))
    const grid = rectangle.map(r => r.slice())
    const ops = [], expected = []
    for (let k = 0; k < 1 + rnd(10); k++) {
      if (rnd(2) === 0) {
        const r1 = rnd(rows), r2 = r1 + rnd(rows - r1), c1 = rnd(cols), c2 = c1 + rnd(cols - c1), v = 1 + rnd(9)
        ops.push(['updateSubrectangle', r1, c1, r2, c2, v]); expected.push(null)
        for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) grid[r][c] = v
      } else {
        const r = rnd(rows), c = rnd(cols)
        ops.push(['getValue', r, c]); expected.push(grid[r][c])
      }
    }
    assert.deepEqual(run(rectangle, ops), expected, JSON.stringify({ rectangle, ops }))
  }
})

test('1476 every frame names a valid python line', () => {
  const trace = buildTrace({ rectangle: [[1, 2], [3, 4]], ops: [['updateSubrectangle', 0, 0, 1, 1, 5], ['getValue', 1, 0]] })
  const lines = trace.frames.length
  assert.ok(lines > 0)
  for (const frame of trace.frames) {
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(frame.message && frame.phase)
  }
})
