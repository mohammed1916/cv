import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = (mat, k) => buildTrace({ mat, k }).result

// Independent oracle: score every row, sort all rows with a comparator, then slice.
function brute(mat, k) {
  return mat
    .map((row, i) => ({ i, s: row.filter(v => v === 1).length }))
    .sort((a, b) => (a.s - b.s) || (a.i - b.i))
    .slice(0, k)
    .map(x => x.i)
}

test('sample matrix returns the three weakest rows in order', () => {
  const mat = [[1, 1, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 1, 0, 0, 0], [1, 1, 1, 1, 1]]
  assert.deepEqual(solve(mat, 3), [2, 0, 3])
})

test('equal strengths resolve by smaller row index', () => {
  assert.deepEqual(solve([[1, 0], [1, 0], [0, 0], [1, 0]], 4), [2, 0, 1, 3])
})

test('all rows tied keeps the original order', () => {
  assert.deepEqual(solve([[1, 1], [1, 1], [1, 1]], 2), [0, 1])
})

test('an all-zero row is the weakest', () => {
  assert.deepEqual(solve([[1, 1, 1], [0, 0, 0], [1, 0, 0]], 1), [1])
})

test('selecting every row returns the full sorted order', () => {
  assert.deepEqual(solve([[1, 1, 1], [0, 0, 1], [1, 0, 0]], 3), [1, 2, 0])
})

test('random matrices match the brute-force oracle', () => {
  let seed = 5
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const rows = 1 + rnd(8)
    const cols = 1 + rnd(6)
    const mat = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(2)))
    const k = 1 + rnd(rows)
    assert.deepEqual(solve(mat, k), brute(mat, k), JSON.stringify({ mat, k }))
  }
})

test('the parser rejects malformed input', () => {
  assert.throws(() => parseInput('[[1]]'), /object/)
  assert.throws(() => parseInput('{"mat":[[1,0],[1]],"k":1}'), /same length/)
  assert.throws(() => parseInput('{"mat":[[1,2]],"k":1}'), /only 0 or 1/)
  assert.throws(() => parseInput('{"mat":[[1,0]],"k":2}'), /k is/)
})

test('frames use declared phases and finish with the answer', () => {
  const run = buildTrace({ mat: [[1, 0], [0, 0]], k: 1 })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) assert.ok(ids.has(frame.phase) && frame.activeLine >= 1)
  assert.deepEqual(run.frames.at(-1).snapshot.chosen, [1])
})
