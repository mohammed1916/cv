import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, examples } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('1683 the sample keeps the rows longer than fifteen characters', () => {
  assert.deepEqual(solve(examples[0].input), [3, 5])
})

test('1683 length exactly fifteen is dropped and sixteen is kept', () => {
  assert.deepEqual(solve(examples[1].input), [11])
})

test('1683 the output is sorted by tweet_id even when rows arrive out of order', () => {
  const rows = [
    { tweet_id: 9, content: 'x'.repeat(30) },
    { tweet_id: 2, content: 'x'.repeat(16) },
    { tweet_id: 5, content: 'x'.repeat(3) },
  ]
  assert.deepEqual(buildTrace(rows).result, [2, 9])
})

test('1683 every row is measured and the last frame is the result', () => {
  const run = buildTrace(parseInput(examples[0].input))
  const measured = run.frames.filter(f => f.phase === 'measure').length
  assert.equal(measured, 5)
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('1683 malformed tables are rejected', () => {
  assert.throws(() => parseInput('{"Tweets":[]}'), /1 to 12/)
  assert.throws(() => parseInput('{"Tweets":[{"tweet_id":1,"content":"a"},{"tweet_id":1,"content":"b"}]}'), /unique/)
  assert.throws(() => parseInput('{"Tweets":[{"tweet_id":1,"content":5}]}'), /text/)
  assert.throws(() => parseInput('[1,2]'), /Tweets/)
})
