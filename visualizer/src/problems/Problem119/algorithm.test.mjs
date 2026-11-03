import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

// Independent oracle: Pascal's rule through a full 2D table, then read off the requested row.
function oracle(k) {
  const table = [[1]]
  for (let r = 1; r <= k; r++) {
    const prev = table[r - 1]
    table.push(Array.from({ length: r + 1 }, (_, c) => (c === 0 || c === r ? 1 : prev[c - 1] + prev[c])))
  }
  return table[k]
}

test('row 0 and row 1 are the base rows', () => {
  assert.deepEqual(buildTrace(0).result, [1])
  assert.deepEqual(buildTrace(1).result, [1, 1])
})

test('row 3 and row 4 match the binomial rule', () => {
  assert.deepEqual(buildTrace(3).result, [1, 3, 3, 1])
  assert.deepEqual(buildTrace(4).result, [1, 4, 6, 4, 1])
})

test('every row from 0 to 30 agrees with the table oracle', () => {
  for (let k = 0; k <= 30; k++) assert.deepEqual(buildTrace(k).result, oracle(k), `row ${k}`)
})

test('every frame has a valid phase, code line, message and snapshot', () => {
  const run = buildTrace(5)
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot && Array.isArray(frame.snapshot.row))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(python.split('\n').length, code.length)
})

test('input validation rejects out-of-range and non-integer indices', () => {
  assert.throws(() => parseInput('31'))
  assert.throws(() => parseInput('-1'))
  assert.throws(() => parseInput('2.5'))
  assert.throws(() => parseInput(''))
  assert.equal(parseInput(' 7 '), 7)
})
