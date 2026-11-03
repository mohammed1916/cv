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

test('1127 splits each date into mobile, desktop and both with zero totals kept', () => {
  assert.deepEqual(run(sample).result, [
    { spend_date: '2019-07-01', platform: 'both', total_amount: 150, total_users: 1 },
    { spend_date: '2019-07-01', platform: 'desktop', total_amount: 300, total_users: 1 },
    { spend_date: '2019-07-01', platform: 'mobile', total_amount: 200, total_users: 1 },
    { spend_date: '2019-07-02', platform: 'both', total_amount: 0, total_users: 0 },
    { spend_date: '2019-07-02', platform: 'desktop', total_amount: 10, total_users: 1 },
    { spend_date: '2019-07-02', platform: 'mobile', total_amount: 0, total_users: 0 },
  ])
  assertFrames(run(sample))
})

test('1127 rejects a platform other than mobile or desktop', () => {
  assert.throws(() => parseInput('{"spending":[{"user_id":1,"spend_date":"2019-07-01","platform":"tablet","amount":5}]}'))
})
