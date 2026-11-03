import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: dynamic programming over every split point, maximising the number of balanced pieces.
function bestSplit(s) {
  const n = s.length
  const balancedRange = (i, j) => { let b = 0; for (let k = i; k < j; k++) b += s[k] === 'L' ? 1 : -1; return b === 0 }
  const dp = Array(n + 1).fill(-Infinity)
  dp[0] = 0
  for (let j = 1; j <= n; j++) for (let i = 0; i < j; i++) if (dp[i] > -Infinity && balancedRange(i, j)) dp[j] = Math.max(dp[j], dp[i] + 1)
  return dp[n]
}

test('sample-style strings split into the maximum number of balanced pieces', () => {
  assert.equal(buildTrace({ s: 'LRLRLRLR' }).result, 4)
  assert.equal(buildTrace({ s: 'LLLLRRRR' }).result, 1)
})

test('nested pieces are counted once each at their outer return to zero', () => {
  assert.equal(buildTrace({ s: 'LRLLRRLRRRLLLRRL' }).result, bestSplit('LRLLRRLRRRLLLRRL'))
})

test('random balanced strings agree with the dynamic-programming oracle', () => {
  let state = 17
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return (state >>> 16) % m }
  for (let t = 0; t < 400; t++) {
    const half = 1 + rand(10)
    const chars = [...'L'.repeat(half) + 'R'.repeat(half)]
    for (let i = chars.length - 1; i > 0; i--) { const j = rand(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]] }
    const s = chars.join('')
    assert.equal(buildTrace({ s }).result, bestSplit(s), s)
  }
})

test('every frame has narration and a valid code line', () => {
  const run = buildTrace({ s: 'LRRL' })
  for (const frame of run.frames) {
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 9)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('parseInput rejects unbalanced or non-LR strings', () => {
  assert.throws(() => parseInput('{"s":"LLR"}'))
  assert.throws(() => parseInput('{"s":"LXRR"}'))
  assert.deepEqual(parseInput('{"s":"LR"}'), { s: 'LR' })
})
