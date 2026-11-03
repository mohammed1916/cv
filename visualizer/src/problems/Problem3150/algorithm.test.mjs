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

test('3150 flags four hashtags and four mentions, keeps short tweets', () => {
  const trace = run('{"Tweets":[{"tweet_id":1,"content":"Let us meet at noon"},{"tweet_id":2,"content":"#a #b #c #d are too many tags"},{"tweet_id":3,"content":"@ana hi @ben and @cy and @dee"},{"tweet_id":4,"content":"Short note #one"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ tweet_id: 2 }, { tweet_id: 3 }])
})

test('3150 a tweet of exactly 140 characters is still valid, 141 is not', () => {
  const ok = 'a'.repeat(140)
  const bad = 'a'.repeat(141)
  const trace = run(JSON.stringify({ Tweets: [{ tweet_id: 7, content: ok }, { tweet_id: 8, content: bad }] }))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ tweet_id: 8 }])
})

test('3150 three marks of each kind are allowed', () => {
  const trace = run('{"Tweets":[{"tweet_id":9,"content":"#a #b #c @x @y @z"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
  assert.throws(() => parseInput('{"Tweets":[{"tweet_id":1.5,"content":"x"}]}'))
})
