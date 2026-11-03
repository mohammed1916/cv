import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Brute force: visit every cell once and add it when it lies on either diagonal.
function brute(mat) {
  const n = mat.length
  let sum = 0
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (r === c || r + c === n - 1) sum += mat[r][c]
  return sum
}

test('own sample grids match the brute-force diagonal sum', () => {
  for (const mat of [[[2, 0], [1, 3]], [[5, 1, 4], [0, 9, 2], [7, 3, 6]], [[4]]]) {
    assert.equal(buildTrace(mat).result, brute(mat), JSON.stringify(mat))
  }
})

test('the centre of an odd grid is counted once, not twice', () => {
  assert.equal(buildTrace([[5, 1, 4], [0, 9, 2], [7, 3, 6]]).result, 5 + 4 + 9 + 7 + 6)
})

test('random grids agree with brute force', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rand(8)
    const mat = Array.from({ length: n }, () => Array.from({ length: n }, () => rand(19) - 9))
    assert.equal(buildTrace(mat).result, brute(mat), JSON.stringify(mat))
  }
})

test('every frame names a real code line, a Python line and a known phase', () => {
  const run = buildTrace([[1, 2, 3], [4, 5, 6], [7, 8, 9]].map(r => r.map(v => v - 5)))
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
    assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('parseInput rejects non-square or out-of-range grids', () => {
  assert.throws(() => parseInput('[[1,2],[3]]'), /by/)
  assert.throws(() => parseInput('[[10]]'), /-9 to 9/)
  assert.throws(() => parseInput('[]'))
})
