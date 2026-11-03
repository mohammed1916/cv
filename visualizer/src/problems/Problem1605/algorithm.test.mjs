import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// The answer is not unique, so the checks test the required properties directly.
function assertValidGrid(grid, rows, cols) {
  assert.equal(grid.length, rows.length)
  grid.forEach((row, r) => {
    assert.equal(row.length, cols.length)
    row.forEach(v => assert.ok(Number.isInteger(v) && v >= 0))
    assert.equal(row.reduce((a, b) => a + b, 0), rows[r], `row ${r}`)
  })
  cols.forEach((c, k) => assert.equal(grid.reduce((a, row) => a + row[k], 0), c, `column ${k}`))
}

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 10)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, `code line ${f.activeLine}`)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.split('\n').length, `python line ${f.pythonLine}`)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('sample builds a grid that meets every row and column total', () => {
  const run = buildTrace(parseInput('{"rows":[5,0,4],"cols":[2,6,1]}'))
  assert.deepEqual(run.result, [[2, 3, 0], [0, 0, 0], [0, 3, 1]])
  assertValidGrid(run.result, [5, 0, 4], [2, 6, 1])
  assertFrames(run)
})

test('single cell and all-zero demands are handled', () => {
  assertValidGrid(buildTrace(parseInput('{"rows":[7],"cols":[7]}')).result, [7], [7])
  assertValidGrid(buildTrace(parseInput('{"rows":[0,0],"cols":[0,0,0]}')).result, [0, 0], [0, 0, 0])
})

test('random consistent demands always produce a valid nonnegative grid', () => {
  let seed = 5
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m }
  for (let t = 0; t < 200; t++) {
    const m = 1 + rand(6), n = 1 + rand(6)
    const cols = Array.from({ length: n }, () => rand(9))
    const total = cols.reduce((a, b) => a + b, 0)
    // Split the same total across rows so the sums agree.
    const rows = Array.from({ length: m }, () => 0)
    for (let k = 0; k < total; k++) rows[rand(m)] += 1
    const run = buildTrace({ rows, cols })
    assertValidGrid(run.result, rows, cols)
    assertFrames(run)
  }
})

test('mismatched totals are rejected', () => {
  assert.throws(() => parseInput('{"rows":[1,2],"cols":[1,1]}'), /total/)
})
