import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

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

test('2377 sample orders by gold, silver, bronze, then country', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result.map(row => row.country), ['Chile', 'Norway', 'Oman', 'Brazil', 'Peru'])
})

test('2377 a full tie is broken by country name ascending', () => {
  const trace = run('{"Olympic":[{"country":"Zed","gold_medals":1,"silver_medals":0,"bronze_medals":0},{"country":"Abe","gold_medals":1,"silver_medals":0,"bronze_medals":0}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result.map(row => row.country), ['Abe', 'Zed'])
})

test('2377 rejects a row without a bronze count', () => {
  assert.throws(() => parseInput('{"Olympic":[{"country":"X","gold_medals":1,"silver_medals":0}]}'))
})
