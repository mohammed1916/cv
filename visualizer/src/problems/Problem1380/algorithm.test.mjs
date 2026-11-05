import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, phases } from './algorithm.js'

const solve = matrix => buildTrace(parseInput(JSON.stringify({ matrix }))).result

// Independent oracle: check every cell against explicit row and column scans.
function brute(matrix) {
  const out = []
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      const v = matrix[i][j]
      const rowOk = matrix[i].every(x => x >= v)
      const colOk = matrix.every(row => row[j] <= v)
      if (rowOk && colOk) out.push(v)
    }
  }
  return out
}

test('hand-checked matrices', () => {
  assert.deepEqual(solve([[1, 2], [3, 4]]), [3])
  assert.deepEqual(solve([[3, 7, 8], [9, 11, 13], [15, 16, 17]]), [15])
  assert.deepEqual(solve([[1, 4], [3, 2]]), [])
  assert.deepEqual(solve([[7]]), [7])
})

test('random distinct matrices agree with the scan oracle', () => {
  let state = 3
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return (state >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rand(6), cols = 1 + rand(6)
    const pool = Array.from({ length: 100 }, (_, i) => i + 1).sort(() => rand(3) - 1) // official values start at 1
    const matrix = Array.from({ length: rows }, (_, i) => pool.slice(i * cols, (i + 1) * cols))
    if (matrix.some(row => row.length !== cols)) continue
    assert.deepEqual(solve(matrix), brute(matrix), JSON.stringify(matrix))
  }
})

test('every frame carries a phase, a code line, narration and a snapshot', () => {
  const run = buildTrace(parseInput('{"matrix":[[3,7,8],[9,11,13],[15,16,17]]}'))
  const ids = phases.map(p => p.id)
  for (const frame of run.frames) {
    assert.ok(ids.includes(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid input is rejected with a message', () => {
  assert.throws(() => parseInput('{"matrix":[[1,2],[3]]}'), /same length/)
  assert.throws(() => parseInput('{"matrix":[[1,1],[2,3]]}'), /distinct/)
})
