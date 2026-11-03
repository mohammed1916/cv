import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, examples } from './algorithm.js'

// Independent reference: try every top-left corner and every side, and check every border cell directly.
function brute(grid) {
  const n = grid.length, m = grid[0].length
  let best = 0
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) for (let s = 1; i + s <= n && j + s <= m; s++) {
    let ok = true
    for (let k = 0; k < s && ok; k++) {
      ok = grid[i][j + k] === 1 && grid[i + s - 1][j + k] === 1 && grid[i + k][j] === 1 && grid[i + k][j + s - 1] === 1
    }
    if (ok) best = Math.max(best, s * s)
  }
  return best
}

function randomGrid(seed) {
  let state = seed
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const n = 1 + rand(6), m = 1 + rand(6)
  return Array.from({ length: n }, () => Array.from({ length: m }, () => (rand(3) === 0 ? 0 : 1)))
}

test('examples and random grids agree with the brute-force reference', () => {
  for (const example of examples) {
    const grid = parseInput(example.input)
    assert.equal(buildTrace(grid).result, brute(grid), example.label)
  }
  for (let seed = 1; seed <= 200; seed++) {
    const grid = randomGrid(seed)
    assert.equal(buildTrace(grid).result, brute(grid), JSON.stringify(grid))
  }
})

test('the sample grid gives the square area it was built to show', () => {
  assert.equal(buildTrace(parseInput(examples[0].input)).result, brute(parseInput(examples[0].input)))
})

test('every frame has a declared phase, a valid code line, narration and a snapshot', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const run = buildTrace(parseInput(examples[0].input))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid grids are rejected with a readable message', () => {
  assert.throws(() => parseInput('[[1,2]]'), /0 or 1/)
  assert.throws(() => parseInput('[[1,0],[1]]'), /Row 2/)
  assert.throws(() => parseInput('[]'), /1 to 8 rows/)
})
