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

const SAMPLE = '{"Salaries":[{"employee_id":1,"employee_name":"Ana","salary":5200,"department":"Marketing"},{"employee_id":2,"employee_name":"Ben","salary":7100,"department":"Engineering"},{"employee_id":3,"employee_name":"Cara","salary":6400,"department":"Marketing"},{"employee_id":4,"employee_name":"Dev","salary":6900,"department":"Engineering"},{"employee_id":5,"employee_name":"Eli","salary":9000,"department":"Sales"},{"employee_id":6,"employee_name":"Fay","salary":7300,"department":"Engineering"}]}'
const run = text => buildTrace(parseInput(text))

test('2853 takes the gap between the two department maxima', () => {
  assert.deepEqual(run(SAMPLE).result, [{ salary_difference: 900 }])
  assertFrames(run(SAMPLE))
})

test('2853 reports the gap as a positive number when Marketing is higher', () => {
  const text = '{"Salaries":[{"employee_id":1,"employee_name":"Gus","salary":8000,"department":"Marketing"},{"employee_id":2,"employee_name":"Hal","salary":7300,"department":"Engineering"}]}'
  assert.deepEqual(run(text).result, [{ salary_difference: 700 }])
  assertFrames(run(text))
})

test('2853 needs at least one row from each department', () => {
  assert.throws(() => parseInput('{"Salaries":[{"employee_id":1,"employee_name":"Gus","salary":8000,"department":"Marketing"}]}'))
})
