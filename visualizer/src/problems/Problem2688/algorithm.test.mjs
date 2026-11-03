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

const SAMPLE = '{"Users":[{"user_id":1,"item":"pen","created_at":"2025-04-01","amount":10},{"user_id":1,"item":"ink","created_at":"2025-04-06","amount":4},{"user_id":2,"item":"pad","created_at":"2025-04-01","amount":7},{"user_id":2,"item":"pad","created_at":"2025-04-09","amount":3},{"user_id":3,"item":"cap","created_at":"2025-04-02","amount":9},{"user_id":3,"item":"cap","created_at":"2025-04-02","amount":2},{"user_id":4,"item":"box","created_at":"2025-04-03","amount":5},{"user_id":4,"item":"box","created_at":"2025-04-10","amount":5}]}'

test('2688 sample keeps users 1 and 4 only', () => {
  const trace = run(SAMPLE)
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 1 }, { user_id: 4 }])
})

test('2688 a repeat found through a third purchase still counts', () => {
  const trace = run('{"Users":[{"user_id":5,"item":"a","created_at":"2025-04-20","amount":1},{"user_id":5,"item":"b","created_at":"2025-04-27","amount":1},{"user_id":5,"item":"c","created_at":"2025-04-30","amount":1}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 5 }])
})

test('2688 rejects a purchase without a created_at date', () => {
  assert.throws(() => parseInput('{"Users":[{"user_id":1,"item":"pen","amount":10}]}'))
})
