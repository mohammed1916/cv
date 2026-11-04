import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'match', 'output', 'done'])

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(PHASES.has(f.phase), f.phase)
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows) && Array.isArray(f.columns))
  }
  assert.deepEqual(run.frames.at(-1).rows, run.result)
}

const bins = (a, b, c, d) => [
  { bin: '[0-5>', total: a },
  { bin: '[5-10>', total: b },
  { bin: '[10-15>', total: c },
  { bin: '15 or more', total: d },
]

test('1435 counts sessions into minute bins and keeps empty bins', () => {
  const run = buildTrace(parseInput(JSON.stringify({ Sessions: [
    { session_id: 1, duration: 100 },
    { session_id: 2, duration: 400 },
    { session_id: 3, duration: 1000 },
    { session_id: 4, duration: 299 },
    { session_id: 5, duration: 900 },
  ] })))
  assert.deepEqual(run.result, bins(2, 1, 0, 2))
  checkFrames(run)
})

test('1435 uses half-open edges: 300 and 900 seconds start the next bin', () => {
  const run = buildTrace(parseInput('{"Sessions":[{"session_id":1,"duration":299},{"session_id":2,"duration":300},{"session_id":3,"duration":899},{"session_id":4,"duration":900}]}'))
  assert.deepEqual(run.result, bins(1, 1, 1, 1))
  checkFrames(run)
})

test('1435 rejects a negative duration', () => {
  assert.throws(() => parseInput('{"Sessions":[{"session_id":1,"duration":-5}]}'))
})
