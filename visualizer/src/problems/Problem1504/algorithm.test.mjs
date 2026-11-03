import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent oracle: try every rectangle and keep the ones made only of ones.
function bruteForce(mat) {
  const rows = mat.length, cols = mat[0].length
  let count = 0
  for (let r1 = 0; r1 < rows; r1++) for (let r2 = r1; r2 < rows; r2++)
    for (let c1 = 0; c1 < cols; c1++) for (let c2 = c1; c2 < cols; c2++) {
      let ok = true
      for (let r = r1; r <= r2 && ok; r++) for (let c = c1; c <= c2; c++) if (mat[r][c] !== 1) { ok = false; break }
      if (ok) count++
    }
  return count
}

test('a small sample grid matches the brute-force count', () => {
  const mat = [[1, 1, 0, 1], [1, 1, 1, 1], [0, 1, 1, 1]]
  assert.equal(buildTrace(mat).result, bruteForce(mat))
})

test('a full block and a single zero cell', () => {
  assert.equal(buildTrace([[1, 1], [1, 1]]).result, 9)
  assert.equal(buildTrace([[0]]).result, 0)
  assert.equal(buildTrace([[1]]).result, 1)
})

test('random grids agree with the brute-force oracle', () => {
  let seed = 3
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(6), cols = 1 + rnd(6)
    const mat = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rnd(10) < 7 ? 1 : 0)))
    assert.equal(buildTrace(mat).result, bruteForce(mat), JSON.stringify(mat))
  }
})

test('parseInput accepts valid grids and rejects malformed ones', () => {
  assert.deepEqual(parseInput('[[1,0],[1,1]]'), [[1, 0], [1, 1]])
  assert.throws(() => parseInput('[[1,0],[1]]'), /same length/)
  assert.throws(() => parseInput('[[2]]'), /0 or 1/)
  assert.throws(() => parseInput('[]'), /1 to 6 rows/)
  assert.throws(() => parseInput('[1,0]'), /1 to 6 rows/)
})

test('every frame names a real phase and in-range code lines', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace([[1, 1, 0], [1, 1, 1]])
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length - 1)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
