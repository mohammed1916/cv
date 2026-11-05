import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

function brute({ nums, k }) {
  const n = nums.length
  const dp = new Array(n)
  dp[0] = nums[0]
  for (let i = 1; i < n; i++) {
    let best = -Infinity
    for (let j = Math.max(0, i - k); j < i; j++) best = Math.max(best, dp[j])
    dp[i] = nums[i] + best
  }
  return dp[n - 1]
}

test('1696 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 11)
  assert.ok(python.includes('def maxResult'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1696 matches a quadratic reference on random inputs', () => {
  let seed = 41
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const nums = Array.from({ length: n }, () => rnd(41) - 20)
    const k = 1 + rnd(n)
    assert.equal(buildTrace({ nums, k }).result, brute({ nums, k }), JSON.stringify({ nums, k }))
  }
})

test('1696 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})
