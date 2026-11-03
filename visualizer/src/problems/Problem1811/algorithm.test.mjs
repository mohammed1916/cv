import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const SAMPLE = '{"Contests":[{"contest_id":1,"gold_medal":1,"silver_medal":2,"bronze_medal":3},{"contest_id":2,"gold_medal":1,"silver_medal":4,"bronze_medal":3},{"contest_id":3,"gold_medal":1,"silver_medal":5,"bronze_medal":3},{"contest_id":4,"gold_medal":7,"silver_medal":8,"bronze_medal":9},{"contest_id":6,"gold_medal":2,"silver_medal":10,"bronze_medal":11}],"Users":[{"user_id":1,"mail":"ann@example.com","name":"Ann"},{"user_id":2,"mail":"bo@example.com","name":"Bo"},{"user_id":3,"mail":"cy@example.com","name":"Cy"},{"user_id":4,"mail":"di@example.com","name":"Di"}]}'

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

test('1811 sample lists Ann (three golds and a run) once and Cy (a bronze run)', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { name: 'Ann', mail: 'ann@example.com' },
    { name: 'Cy', mail: 'cy@example.com' },
  ])
})

test('1811 two golds without a run do not qualify', () => {
  const trace = buildTrace(parseInput('{"Contests":[{"contest_id":1,"gold_medal":5,"silver_medal":2,"bronze_medal":3},{"contest_id":3,"gold_medal":5,"silver_medal":4,"bronze_medal":6}],"Users":[{"user_id":5,"mail":"e@example.com","name":"Ed"}]}'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('1811 rejects a contest row without a bronze medal', () => {
  assert.throws(() => parseInput('{"Contests":[{"contest_id":1,"gold_medal":1,"silver_medal":2}],"Users":[{"user_id":1,"mail":"a@example.com","name":"A"}]}'))
})
