import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(phase => phase.id))

function assertFrames(trace) {
  assert.ok(trace.frames.length > 1)
  for (const frame of trace.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `unknown phase ${frame.phase}`)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.columns) && Array.isArray(frame.rows))
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

const run = text => buildTrace(parseInput(text))

test('3204 AND keeps shared bits and OR combines all bits', () => {
  // 6 & 12 = 4, 4 & 14 = 4; 6 | 12 = 14, 14 | 14 = 14
  const trace = run('{"user_permissions":[{"user_id":1,"permissions":6},{"user_id":2,"permissions":12},{"user_id":3,"permissions":14}]}')
  assert.deepEqual(trace.result, [{ common_permissions: 4, combined_permissions: 14 }])
  assertFrames(trace)
})

test('3204 identical permissions are returned unchanged', () => {
  assert.deepEqual(run('{"user_permissions":[{"user_id":7,"permissions":5},{"user_id":8,"permissions":5}]}').result, [{ common_permissions: 5, combined_permissions: 5 }])
})

test('3204 rejects an empty table', () => {
  assert.throws(() => parseInput('{"user_permissions":[]}'))
})
