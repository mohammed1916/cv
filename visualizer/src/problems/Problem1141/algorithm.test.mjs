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

test('1141 counts distinct active users per day inside the 30-day window', () => {
  assert.deepEqual(run(sample).result, [
    { day: '2019-06-28', active_users: 1 },
    { day: '2019-07-20', active_users: 2 },
    { day: '2019-07-21', active_users: 2 },
  ])
  assertFrames(run(sample))
})

test('1141 no activity gives no rows', () => {
  assert.deepEqual(buildTrace(parseInput('{"activity":[]}')).result, [])
})
