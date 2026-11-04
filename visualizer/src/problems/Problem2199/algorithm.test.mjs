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

const sample = '{"Keywords":[{"topic_id":1,"word":"sleep"},{"topic_id":1,"word":"diet"},{"topic_id":2,"word":"run"},{"topic_id":2,"word":"diet"},{"topic_id":3,"word":"flight"}],"Posts":[{"post_id":1,"content":"Better sleep and a calm diet"},{"post_id":2,"content":"Morning run, then DIET review"},{"post_id":3,"content":"Booked a flight to Lisbon"},{"post_id":4,"content":"Nothing relevant here"},{"post_id":5,"content":"Diets change; running more"}]}'

test('2199 sample joins whole words case-insensitively and sorts topics', () => {
  const trace = run(sample)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { post_id: 1, topics: '1,2' },
    { post_id: 2, topics: '1,2' },
    { post_id: 3, topics: '3' },
    { post_id: 4, topics: 'Ambiguous!' },
    { post_id: 5, topics: 'Ambiguous!' },
  ])
})

test('2199 a keyword must match a whole word, so diets does not match diet', () => {
  const trace = run('{"Keywords":[{"topic_id":1,"word":"diet"}],"Posts":[{"post_id":7,"content":"Diets"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ post_id: 7, topics: 'Ambiguous!' }])
})

test('2199 rejects posts without content', () => {
  assert.throws(() => parseInput('{"Keywords":[{"topic_id":1,"word":"diet"}],"Posts":[{"post_id":1}]}'))
})

test('2199 topic ids sort as numbers, so 2 comes before 10', () => {
  const trace = run('{"Keywords":[{"topic_id":10,"word":"sleep"},{"topic_id":2,"word":"sleep"}],"Posts":[{"post_id":1,"content":"sleep"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ post_id: 1, topics: '2,10' }])
})
