import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute(matrix) {
  const m = matrix.length, n = matrix[0].length
  let best = 0
  for (let r1 = 0; r1 < m; r1++) for (let r2 = r1; r2 < m; r2++) {
    const cols = []
    for (let c = 0; c < n; c++) if (matrix.slice(r1, r2 + 1).every(row => row[c] === 1)) cols.push(c)
    best = Math.max(best, cols.length * (r2 - r1 + 1))
  }
  return best
}

test('1727 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 9)
  assert.ok(python.includes('def largestSubmatrix'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1727 matches a brute force over row bands', () => {
  let seed = 191
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(4), n = 1 + rnd(4)
    const matrix = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(2)))
    assert.equal(buildTrace(matrix).result, brute(matrix), JSON.stringify(matrix))
  }
})

test('1727 rejects invalid input', () => {
  assert.throws(() => parseInput('[[1,2]]'))
  assert.throws(() => parseInput('[[1,0],[1]]'))
})
