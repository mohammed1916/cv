import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: list every cell with its key (row + column, then bottom row first) and sort.
function oracle(nums) {
  const cells = []
  nums.forEach((row, i) => row.forEach((value, j) => cells.push({ d: i + j, i, value })))
  cells.sort((a, b) => a.d - b.d || b.i - a.i)
  return cells.map(c => c.value)
}

test('sample rows give the diagonal order from bottom-left to top-right', () => {
  assert.deepEqual(buildTrace([[1, 2, 3], [4], [5, 6]]).result, [1, 4, 2, 5, 3, 6])
})

test('a single row or a single column is read in its own order', () => {
  assert.deepEqual(buildTrace([[7, 8, 9]]).result, [7, 8, 9])
  assert.deepEqual(buildTrace([[7], [8], [9]]).result, [7, 8, 9])
})

test('random ragged grids agree with the independent oracle', () => {
  let state = 3
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rand(6)
    const nums = Array.from({ length: rows }, () => Array.from({ length: 1 + rand(6) }, () => rand(100) - 50))
    assert.deepEqual(buildTrace(nums).result, oracle(nums), JSON.stringify(nums))
  }
})

test('every frame names a valid phase and a code line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace([[1, 2], [3, 4, 5]])
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 5)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'result')
  assert.equal(code.length, python.split('\n').length)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[]'), /1 to 50 rows/)
  assert.throws(() => parseInput('[[1,2],[]]'), /Row 2/)
  assert.throws(() => parseInput('[[1.5]]'), /only integers/)
  assert.throws(() => parseInput('nope'), /JSON array/)
})
