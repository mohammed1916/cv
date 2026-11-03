import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

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

const sample = examples[0].input
const run = text => buildTrace(parseInput(text))

test('1113 counts distinct reported posts per reason on the target day', () => {
  assert.deepEqual(run(sample).result, [
    { report_reason: 'abuse', report_count: 1 },
    { report_reason: 'spam', report_count: 2 },
  ])
  assertFrames(run(sample))
})

test('1113 an empty table gives no rows', () => {
  assert.deepEqual(buildTrace(parseInput('{"actions":[]}')).result, [])
})

test('1113 rejects a row without an action column', () => {
  assert.throws(() => parseInput('{"actions":[{"user_id":1,"post_id":1,"action_date":"2019-07-04","extra":"spam"}]}'))
})
