import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, cellAtStep } from './algorithm.js'

// Independent synchronous oracle: scan the entire immutable previous grid each round.
function simulate(n, m, sources) {
  let grid = Array.from({ length: n }, () => Array(m).fill(0))
  for (const [r, c, color] of sources) grid[r][c] = color
  const history = [grid]
  while (grid.some(row => row.includes(0))) {
    const next = grid.map((row, r) => row.map((color, c) => color || Math.max(
      grid[r - 1]?.[c] || 0, grid[r + 1]?.[c] || 0, grid[r][c - 1] || 0, grid[r][c + 1] || 0)))
    history.push(next)
    grid = next
  }
  return history
}

test('3905 official examples and frozen source colors', () => {
  for (const [n, m, sources, expected] of [
    [3, 3, [[0, 0, 1], [2, 2, 2]], [[1, 1, 2], [1, 2, 2], [2, 2, 2]]],
    [3, 3, [[0, 1, 3], [1, 1, 5]], [[3, 3, 3], [5, 5, 5], [5, 5, 5]]],
    [2, 2, [[1, 1, 5]], [[5, 5], [5, 5]]],
    [1, 2, [[0, 0, 1], [0, 1, 1000000]], [[1, 1000000]]],
  ]) assert.deepEqual(buildTrace({ n, m, sources }).result, expected)
})

test('3905 exhaustive 2x3 grids match synchronous simulation and every visible frame', () => {
  for (let config = 1; config < 3 ** 6; config++) {
    const sources = []
    for (let i = 0; i < 6; i++) {
      const color = Math.floor(config / 3 ** i) % 3
      if (color) sources.push([Math.floor(i / 3), i % 3, color])
    }
    const history = simulate(2, 3, sources), run = buildTrace({ n: 2, m: 3, sources })
    assert.deepEqual(run.result, history.at(-1))
    assert.deepEqual(buildTrace({ n: 2, m: 3, sources: [...sources].reverse() }).result, run.result)
    for (const frame of run.frames) {
      assert.equal(frame.colored, history[frame.time].flat().filter(Boolean).length)
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
        const cell = cellAtStep(run, frame, r, c), committed = history[frame.time][r][c]
        const proposed = frame.phase === 'propose' && !committed && history[frame.time + 1][r][c]
        assert.equal(cell.value, proposed ? `${proposed}?` : committed)
        assert.equal(cell.role === 'pending', Boolean(proposed))
      }
    }
  }
})

test('3905 full constraints retain all waves and all cells', () => {
  const corridor = buildTrace(parseInput('{"n":1,"m":100000,"sources":[[0,0,1000000]]}'))
  assert.equal(corridor.frames.length, 200000)
  assert.equal(corridor.arrival[99999], 99999)
  assert.equal(corridor.result[0].length, 100000)
  assert.ok(corridor.result[0].every(v => v === 1000000))
  const sources = Array.from({ length: 100000 }, (_, i) => [Math.floor(i / 1000), i % 1000, i + 1])
  const filled = buildTrace({ n: 100, m: 1000, sources })
  assert.equal(filled.frames.length, 2)
  assert.equal(filled.result[99][999], 100000)
})

test('3905 rejects invalid dimensions and duplicate or invalid sources', () => {
  for (const input of [null, {}, { n: 0, m: 1, sources: [[0, 0, 1]] }, { n: 1000, m: 1000, sources: [[0, 0, 1]] },
    { n: 1, m: 1, sources: [] }, { n: 1, m: 2, sources: [[0, 0, 1], [0, 0, 2]] },
    ...[[1, 0, 1], [0, 2, 1], [0, 0, 0], [0, 0, 1000001], [0, 0, 1.5], [0, 0], null].map(source => ({ n: 1, m: 2, sources: [source] }))]) {
    assert.throws(() => parseInput(JSON.stringify(input)))
  }
})
