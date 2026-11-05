import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function simulate(grid) {
  const m = grid.length, n = grid[0].length
  return Array.from({ length: n }, (_, col) => {
    let c = col
    for (let r = 0; r < m; r++) {
      const d = grid[r][c]
      const next = c + d
      if (next < 0 || next >= n || grid[r][next] !== d) return -1
      c = next
    }
    return c
  })
}

test('1706 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 12)
  assert.ok(python.includes('def findBall'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1706 matches the grid walk on random grids', () => {
  let seed = 91
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(5), n = 1 + rnd(5)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => (rnd(2) ? 1 : -1)))
    assert.deepEqual(buildTrace(grid).result, simulate(grid), JSON.stringify(grid))
  }
})

test('1706 rejects invalid grids', () => {
  assert.throws(() => parseInput('[[1,0]]'))
  assert.throws(() => parseInput('[[1,1],[1]]'))
})
