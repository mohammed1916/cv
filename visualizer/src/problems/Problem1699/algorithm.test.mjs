import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'pair', 'done'])

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

test('1699 counts both directions of a pair together', () => {
  const run = buildTrace(parseInput(JSON.stringify({ Calls: [
    { from_id: 1, to_id: 2, duration: 60 },
    { from_id: 2, to_id: 1, duration: 30 },
    { from_id: 3, to_id: 4, duration: 100 },
    { from_id: 4, to_id: 3, duration: 40 },
    { from_id: 3, to_id: 4, duration: 10 },
  ] })))
  assert.deepEqual(run.result, [
    { person1: 1, person2: 2, call_count: 2, total_duration: 90 },
    { person1: 3, person2: 4, call_count: 3, total_duration: 150 },
  ])
  checkFrames(run)
})

test('1699 a single call gives one pair with its own duration', () => {
  const run = buildTrace(parseInput('{"Calls":[{"from_id":9,"to_id":5,"duration":7}]}'))
  assert.deepEqual(run.result, [{ person1: 5, person2: 9, call_count: 1, total_duration: 7 }])
  checkFrames(run)
})

test('1699 rejects a non-integer duration', () => {
  assert.throws(() => parseInput('{"Calls":[{"from_id":1,"to_id":2,"duration":"60"}]}'))
})
