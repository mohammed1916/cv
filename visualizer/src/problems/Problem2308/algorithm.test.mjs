import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.columns))
    assert.equal(typeof frame.message, 'string')
  }
}

test('2308 interleaves female, other and male users round-robin', () => {
  const trace = run('{"Genders":[{"user_id":6,"gender":"other"},{"user_id":5,"gender":"male"},{"user_id":4,"gender":"female"},{"user_id":3,"gender":"other"},{"user_id":2,"gender":"male"},{"user_id":1,"gender":"female"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { user_id: 1, gender: 'female' },
    { user_id: 3, gender: 'other' },
    { user_id: 2, gender: 'male' },
    { user_id: 4, gender: 'female' },
    { user_id: 6, gender: 'other' },
    { user_id: 5, gender: 'male' },
  ])
})

test('2308 keeps reading longer groups after the shorter ones run out', () => {
  const trace = run('{"Genders":[{"user_id":1,"gender":"female"},{"user_id":2,"gender":"male"},{"user_id":3,"gender":"male"},{"user_id":4,"gender":"male"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { user_id: 1, gender: 'female' },
    { user_id: 2, gender: 'male' },
    { user_id: 3, gender: 'male' },
    { user_id: 4, gender: 'male' },
  ])
})

test('2308 rejects a non-integer user_id', () => {
  assert.throws(() => parseInput('{"Genders":[{"user_id":"a","gender":"female"}]}'))
})
