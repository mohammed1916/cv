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

test('users 10 and 13 hold both types, user 11 and 12 hold only one', () => {
  const trace = run('{"Loans":[{"loan_id":1,"user_id":10,"loan_type":"Mortgage"},{"loan_id":2,"user_id":10,"loan_type":"Refinance"},{"loan_id":3,"user_id":10,"loan_type":"Personal"},{"loan_id":4,"user_id":11,"loan_type":"Mortgage"},{"loan_id":5,"user_id":11,"loan_type":"Mortgage"},{"loan_id":6,"user_id":12,"loan_type":"Refinance"},{"loan_id":7,"user_id":13,"loan_type":"Mortgage"},{"loan_id":8,"user_id":13,"loan_type":"Refinance"},{"loan_id":9,"user_id":13,"loan_type":"Mortgage"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ user_id: 10 }, { user_id: 13 }])
})

test('a user with a Mortgage and a Personal loan is not kept', () => {
  const trace = run('{"Loans":[{"loan_id":1,"user_id":20,"loan_type":"Mortgage"},{"loan_id":2,"user_id":20,"loan_type":"Personal"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('rejects a table without its columns', () => {
  assert.throws(() => parseInput('{"Loans":[{"loan_id":1,"user_id":20}]}'))
})
