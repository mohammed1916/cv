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

const SAMPLE = '{"Tweets":[{"tweet_id":1,"tweet_date":"2024-02-03","tweet":"Loving #python today"},{"tweet_id":2,"tweet_date":"2024-02-05","tweet":"#sql is fun"},{"tweet_id":3,"tweet_date":"2024-02-09","tweet":"Trying #python and #sql"},{"tweet_id":4,"tweet_date":"2024-02-14","tweet":"#java rocks"},{"tweet_id":5,"tweet_date":"2024-02-20","tweet":"#sql again"},{"tweet_id":6,"tweet_date":"2024-03-01","tweet":"#python in March"},{"tweet_id":7,"tweet_date":"2024-02-22","tweet":"no tags here"},{"tweet_id":8,"tweet_date":"2024-02-27","tweet":"#sql #java"},{"tweet_id":9,"tweet_date":"2024-02-28","tweet":"#go"}]}'

test('3087 sample ranks sql, python and go, breaking the one-use tie alphabetically', () => {
  const trace = run(SAMPLE)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { hashtag: 'sql', hashtag_count: 3 },
    { hashtag: 'python', hashtag_count: 2 },
    { hashtag: 'go', hashtag_count: 1 },
  ])
})

test('3087 ignores tweets outside February and keeps the tag case-insensitive', () => {
  const trace = run('{"Tweets":[{"tweet_id":1,"tweet_date":"2024-02-01","tweet":"#Ab"},{"tweet_id":2,"tweet_date":"2024-01-31","tweet":"#ab"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ hashtag: 'ab', hashtag_count: 1 }])
})

test('3087 rejects a malformed tweet date', () => {
  assert.throws(() => parseInput('{"Tweets":[{"tweet_id":1,"tweet_date":"2024-2-3","tweet":"#x"}]}'))
})
