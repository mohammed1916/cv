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

test('2004 sample hires three seniors and two juniors', () => {
  // Seniors 10000+20000+30000 = 60000; 40000 more would exceed 70000. Remaining 10000 covers juniors 5000+5000.
  const trace = run('{"Candidates":[{"employee_id":4,"experience":"Senior","salary":40000},{"employee_id":1,"experience":"Senior","salary":10000},{"employee_id":2,"experience":"Senior","salary":20000},{"employee_id":3,"experience":"Senior","salary":30000},{"employee_id":5,"experience":"Junior","salary":5000},{"employee_id":6,"experience":"Junior","salary":5000},{"employee_id":7,"experience":"Junior","salary":12000}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { experience: 'Senior', accepted_candidates: 3 },
    { experience: 'Junior', accepted_candidates: 2 },
  ])
})

test('2004 reports zero seniors and still spends nothing on them', () => {
  // The only senior costs 80000, so the full 70000 is left for juniors: 5000 fits, 5000+70000 does not.
  const trace = run('{"Candidates":[{"employee_id":1,"experience":"Senior","salary":80000},{"employee_id":2,"experience":"Junior","salary":5000},{"employee_id":3,"experience":"Junior","salary":70000}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { experience: 'Senior', accepted_candidates: 0 },
    { experience: 'Junior', accepted_candidates: 1 },
  ])
})

test('2004 rejects a candidate without salary', () => {
  assert.throws(() => parseInput('{"Candidates":[{"employee_id":1,"experience":"Senior"}]}'))
})
