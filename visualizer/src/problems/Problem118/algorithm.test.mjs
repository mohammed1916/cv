import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

// Independent reference: every entry is a binomial coefficient C(r, c).
function binomial(r, c) {
  let value = 1
  for (let i = 1; i <= c; i++) value = (value * (r - c + i)) / i
  return value
}
function reference(numRows) {
  return Array.from({ length: numRows }, (_, r) => Array.from({ length: r + 1 }, (_, c) => binomial(r, c)))
}

test('four rows are built one entry at a time', () => {
  assert.deepEqual(buildTrace(4).result, [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]])
})

test('every size from 1 to 30 matches the binomial reference', () => {
  for (let n = 1; n <= 30; n++) assert.deepEqual(buildTrace(n).result, reference(n), `rows=${n}`)
})

test('parseInput accepts row counts from 1 to 30 only', () => {
  assert.equal(parseInput(' 5 '), 5)
  for (const bad of ['0', '31', 'x', '2.5', '']) assert.throws(() => parseInput(bad))
})

test('every frame names a declared phase and a code line, and the last frame is done', () => {
  const run = buildTrace(5)
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).snapshot.rows, run.result)
})
