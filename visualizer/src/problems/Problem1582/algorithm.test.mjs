import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = mat => buildTrace({ mat }).result

test('own sample matrices give the expected counts', () => {
  assert.equal(solve([[1, 0, 0], [0, 0, 1], [1, 0, 0]]), 1)
  assert.equal(solve([[1, 1], [0, 0]]), 0)
  assert.equal(solve([[0, 1, 0, 0], [0, 0, 0, 1], [1, 0, 0, 0]]), 3)
})

test('a single cell and an all-zero matrix', () => {
  assert.equal(solve([[1]]), 1)
  assert.equal(solve([[0, 0], [0, 0]]), 0)
})

test('frames carry a phase, a pseudocode line, a message and a snapshot', () => {
  const trace = buildTrace(parseInput('{"mat":[[1,0],[0,1]]}'))
  for (const f of trace.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(f.snapshot && typeof f.snapshot === 'object')
  }
  assert.equal(trace.result, 2)
  assert.match(python, /def numSpecial\(mat\):/)
})

test('parseInput rejects malformed matrices', () => {
  assert.throws(() => parseInput('[[1]]'), /object/)
  assert.throws(() => parseInput('{"mat":[[1,0],[1]]}'), /entries/)
  assert.throws(() => parseInput('{"mat":[[2]]}'), /0 or 1/)
})

test('random matrices match a brute-force oracle', () => {
  let seed = 1582
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(6), n = 1 + rnd(6)
    const mat = Array.from({ length: m }, () => Array.from({ length: n }, () => (rnd(3) === 0 ? 1 : 0)))
    let expected = 0
    for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
      if (mat[i][j] !== 1) continue
      const rowOnes = mat[i].reduce((a, b) => a + b, 0)
      const colOnes = mat.reduce((a, row) => a + row[j], 0)
      if (rowOnes === 1 && colOnes === 1) expected++
    }
    assert.equal(solve(mat), expected)
  }
})
