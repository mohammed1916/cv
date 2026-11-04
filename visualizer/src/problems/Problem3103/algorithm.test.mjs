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

const SAMPLE = '{"Tweets":[{"tweet_id":1,"tweet_date":"2024-02-10","tweet":"#ai #ml #ai"},{"tweet_id":2,"tweet_date":"2024-02-11","tweet":"#ml"},{"tweet_id":3,"tweet_date":"2024-02-12","tweet":"#data #ai"},{"tweet_id":4,"tweet_date":"2024-02-09","tweet":"#ai"},{"tweet_id":5,"tweet_date":"2024-03-02","tweet":"#data #data"},{"tweet_id":6,"tweet_date":"2024-03-03","tweet":"#ml"},{"tweet_id":7,"tweet_date":"2024-02-15","tweet":"hello"},{"tweet_id":8,"tweet_date":"2024-02-20","tweet":"#go #ml #data"}]}'

test('3103 sample counts each tag once per February tweet and orders ties by hashtag descending', () => {
  const trace = run(SAMPLE)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { hashtag: '#ml', hashtag_count: 3 },
    { hashtag: '#ai', hashtag_count: 3 },
    { hashtag: '#data', hashtag_count: 2 },
  ])
})

test('3103 a tag repeated inside one tweet counts once', () => {
  const trace = run('{"Tweets":[{"tweet_id":1,"tweet_date":"2024-02-10","tweet":"#x #x #x"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ hashtag: '#x', hashtag_count: 1 }])
})

test('3103 tags dated outside February produce no result', () => {
  const trace = run('{"Tweets":[{"tweet_id":1,"tweet_date":"2024-01-31","tweet":"#a"},{"tweet_id":2,"tweet_date":"2024-03-01","tweet":"#b"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})
