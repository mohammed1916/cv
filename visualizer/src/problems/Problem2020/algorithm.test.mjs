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

test('2020 sample counts accounts 3 and 4', () => {
  const trace = run('{"Subscriptions":[{"account_id":1,"start_date":"2020-06-01","end_date":"2021-02-10"},{"account_id":2,"start_date":"2020-01-01","end_date":"2020-12-31"},{"account_id":3,"start_date":"2021-05-01","end_date":"2021-07-01"},{"account_id":3,"start_date":"2021-08-01","end_date":"2021-09-01"},{"account_id":4,"start_date":"2021-12-20","end_date":"2022-03-01"},{"account_id":5,"start_date":"2019-01-01","end_date":"2022-01-01"}],"Streams":[{"session_id":101,"account_id":1,"stream_date":"2021-03-05"},{"session_id":102,"account_id":4,"stream_date":"2020-11-11"},{"session_id":103,"account_id":5,"stream_date":"2021-01-01"},{"session_id":104,"account_id":2,"stream_date":"2020-03-03"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ accounts_count: 2 }])
})

test('2020 treats both interval ends and the year ends as inclusive', () => {
  // Account 7 ends on 2021-01-01 and has no stream, so it counts. Account 8 streamed on 2021-12-31, so it does not.
  const trace = run('{"Subscriptions":[{"account_id":7,"start_date":"2019-01-01","end_date":"2021-01-01"},{"account_id":8,"start_date":"2021-06-01","end_date":"2021-06-02"}],"Streams":[{"session_id":201,"account_id":8,"stream_date":"2021-12-31"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ accounts_count: 1 }])
})

test('2020 rejects a stream without stream_date', () => {
  assert.throws(() => parseInput('{"Subscriptions":[{"account_id":1,"start_date":"2021-01-01","end_date":"2021-01-02"}],"Streams":[{"session_id":1,"account_id":1}]}'))
})
