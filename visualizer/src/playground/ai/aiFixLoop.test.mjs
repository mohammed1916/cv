import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runAiFixLoop } from './aiFixLoop.js'

const base = { source: 'x', inputSource: '{}', entry: 'f', error: { message: 'boom' } }
const noop = () => {}

test('retries with the failure in the prompt until a proposal runs', async () => {
  const prompts = []
  let calls = 0
  const result = await runAiFixLoop({
    base, roundSize: 3, onUpdate: noop, askToContinue: async () => 'continue',
    signal: new AbortController().signal,
    suggest: async ({ instruction }) => { prompts.push(instruction); calls += 1; return { source: 'ok', raw: `r${calls}` } },
    verify: async () => { if (calls < 3) throw new Error(`fail ${calls}`) },
  })
  assert.equal(result.status, 'fixed')
  assert.equal(result.attempts.length, 3)
  assert.match(prompts[2], /Attempt 2 did not work. Result: fail 2/)
})

test('stops at five attempts and never asks past the limit', async () => {
  const asked = []
  const result = await runAiFixLoop({
    base, roundSize: 2, onUpdate: noop, signal: new AbortController().signal,
    askToContinue: async (count) => { asked.push(count); return 'continue' },
    suggest: async () => ({ source: 'same', raw: '' }),
    verify: async () => { throw new Error('still broken') },
  })
  assert.equal(result.status, 'limit')
  assert.equal(result.attempts.length, 5)
  assert.deepEqual(asked, [2, 4])
})

test('setup errors stop immediately', async () => {
  let calls = 0
  const result = await runAiFixLoop({
    base, roundSize: 1, onUpdate: noop, askToContinue: async () => 'continue', signal: new AbortController().signal,
    suggest: async () => { calls += 1; throw Object.assign(new Error('Enter your key'), { code: 'MISSING_AI_SETUP' }) },
    verify: async () => {},
  })
  assert.equal(result.status, 'setup')
  assert.equal(calls, 1)
})

test('stop at a round boundary ends the loop', async () => {
  const result = await runAiFixLoop({
    base, roundSize: 1, onUpdate: noop, signal: new AbortController().signal,
    askToContinue: async () => 'stop',
    suggest: async () => ({ source: 'x', raw: '' }),
    verify: async () => { throw new Error('bad') },
  })
  assert.equal(result.status, 'stopped')
  assert.equal(result.attempts.length, 1)
})
