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

test('2041 sample keeps candidates 11 and 14', () => {
  // Ava: 17 and 3 years, kept. Ben: 20 but 1 year. Cy: 15 is not above 15. Dee: 16 and 5 years, kept. Eli: 15. Fay: no rounds.
  const trace = run('{"Candidates":[{"candidate_id":11,"name":"Ava","years_of_exp":3,"interview_id":101},{"candidate_id":12,"name":"Ben","years_of_exp":1,"interview_id":102},{"candidate_id":13,"name":"Cy","years_of_exp":2,"interview_id":103},{"candidate_id":14,"name":"Dee","years_of_exp":5,"interview_id":104},{"candidate_id":15,"name":"Eli","years_of_exp":2,"interview_id":105},{"candidate_id":16,"name":"Fay","years_of_exp":2,"interview_id":106}],"Rounds":[{"interview_id":101,"round_id":1,"score":8},{"interview_id":101,"round_id":2,"score":9},{"interview_id":102,"round_id":1,"score":20},{"interview_id":103,"round_id":1,"score":7},{"interview_id":103,"round_id":2,"score":8},{"interview_id":104,"round_id":1,"score":10},{"interview_id":104,"round_id":2,"score":6},{"interview_id":105,"round_id":1,"score":5},{"interview_id":105,"round_id":2,"score":5},{"interview_id":105,"round_id":3,"score":5}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ candidate_id: 11 }, { candidate_id: 14 }])
})

test('2041 rejects a total of exactly 15', () => {
  const trace = run('{"Candidates":[{"candidate_id":1,"name":"Gia","years_of_exp":2,"interview_id":7}],"Rounds":[{"interview_id":7,"round_id":1,"score":15}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('2041 rejects a round without a score', () => {
  assert.throws(() => parseInput('{"Candidates":[{"candidate_id":1,"name":"A","years_of_exp":2,"interview_id":1}],"Rounds":[{"interview_id":1,"round_id":1}]}'))
})
