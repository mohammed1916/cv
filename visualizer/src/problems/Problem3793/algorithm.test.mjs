import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, examples } from './algorithm.js'

test('3793 mixed sample gives the hand-computed report', () => {
  const run = buildTrace(parseInput(examples[0].input))
  assert.deepEqual(run.result, [
    { user_id: 1, prompt_count: 3, avg_tokens: 30 },
    { user_id: 3, prompt_count: 4, avg_tokens: 8.5 },
    { user_id: 7, prompt_count: 3, avg_tokens: 4 },
    { user_id: 9, prompt_count: 3, avg_tokens: 4 },
    { user_id: 6, prompt_count: 3, avg_tokens: 3.33 },
    { user_id: 5, prompt_count: 3, avg_tokens: 2.33 },
  ])
})

test('3793 a user whose prompts all equal the average is dropped (strict comparison)', () => {
  const run = buildTrace({ prompts: [1, 2, 3].map(i => ({ user_id: 2, prompt: `p${i}`, tokens: 5 })) })
  assert.deepEqual(run.result, [])
})

test('3793 users with fewer than three prompts are dropped even with a big spike', () => {
  const run = buildTrace({ prompts: [{ user_id: 4, prompt: 'x', tokens: 100 }, { user_id: 4, prompt: 'y', tokens: 1 }] })
  assert.deepEqual(run.result, [])
})

test('3793 rounding is half up on exact ties', () => {
  // Sum 5 over 8 prompts is 0.625, which rounds to 0.63 (half up).
  const prompts = [1, 1, 1, 1, 1, 0, 0, 0].map((tokens, i) => ({ user_id: 6, prompt: `m${i}`, tokens }))
  const run = buildTrace({ prompts })
  assert.deepEqual(run.result, [{ user_id: 6, prompt_count: 8, avg_tokens: 0.63 }])
})

test('3793 parse rejects duplicate user and prompt pairs', () => {
  assert.throws(() => parseInput('{"prompts":[{"user_id":1,"prompt":"a","tokens":3},{"user_id":1,"prompt":"a","tokens":4}]}'))
  assert.throws(() => parseInput('{"prompts":[{"user_id":1,"prompt":"a","tokens":-3}]}'))
})

test('3793 frames carry the required fields and valid line numbers', () => {
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    for (const frame of run.frames) {
      assert.equal(typeof frame.phase, 'string')
      assert.equal(typeof frame.message, 'string')
      assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
      assert.ok(Array.isArray(frame.rows))
    }
    assert.equal(run.frames[0].phase, 'load')
    assert.deepEqual(run.frames.at(-1).rows, run.result)
  }
})

test('3793 second sample keeps both users with exact averages', () => {
  const run = buildTrace(parseInput(examples[1].input))
  assert.deepEqual(run.result, [
    { user_id: 3, prompt_count: 3, avg_tokens: 9.33 },
    { user_id: 8, prompt_count: 3, avg_tokens: 6 },
  ])
})
