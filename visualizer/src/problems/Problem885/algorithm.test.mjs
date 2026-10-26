import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = a => buildTrace(parseInput(JSON.stringify(a)))

// Independent oracle: unbounded spiral by the "turn right when the cell on the right is unvisited" rule.
function oracle(rows, cols, r0, c0) {
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  const seen = new Set([`${r0},${c0}`])
  let r = r0, c = c0, d = 0
  const out = [[r0, c0]]
  while (out.length < rows * cols) {
    r += dirs[d][0]; c += dirs[d][1]
    seen.add(`${r},${c}`)
    if (r >= 0 && r < rows && c >= 0 && c < cols) out.push([r, c])
    const nd = (d + 1) % 4
    if (!seen.has(`${r + dirs[nd][0]},${c + dirs[nd][1]}`)) d = nd
  }
  return out
}

test('official examples', () => {
  assert.deepEqual(run([1, 4, 0, 0]).result, [[0, 0], [0, 1], [0, 2], [0, 3]])
  assert.deepEqual(run([5, 6, 1, 4]).result.slice(0, 6), [[1, 4], [1, 5], [2, 5], [2, 4], [2, 3], [1, 3]])
})

test('matches the right-hand-rule oracle for every grid and start up to 6x6', () => {
  for (let rows = 1; rows <= 6; rows++) for (let cols = 1; cols <= 6; cols++) for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const t = run([rows, cols, r, c])
    assert.deepEqual(t.result, oracle(rows, cols, r, c))
    assert.equal(t.frames.at(-1).phase, 'done')
    assert.equal(t.result.length, rows * cols)
  }
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('[1,1,1,0]'))
  assert.throws(() => parseInput('[0,1,0,0]'))
  assert.throws(() => parseInput('[1,2,3]'))
  assert.throws(() => parseInput('[13,1,0,0]'))
})
