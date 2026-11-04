import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = weight => buildTrace({ weight }).result

test('3638 hand-computed cases', () => {
  assert.equal(solve([7, 2, 9, 9, 6, 3, 8, 1]), 3)
  assert.equal(solve([5, 5, 5, 2, 5, 5]), 1)
  assert.equal(solve([3, 3, 5, 8]), 0)
  assert.equal(solve([9, 8, 7, 6]), 2)
  assert.equal(solve([1, 1]), 0)
  assert.equal(solve([2, 1]), 1)
})

test('3638 parseInput enforces the domain', () => {
  assert.deepEqual(parseInput('{"weight":[1,1000000000]}'), { weight: [1, 1000000000] })
  assert.throws(() => parseInput('{"weight":[1]}'))
  assert.throws(() => parseInput('{"weight":[0,1]}'))
  assert.throws(() => parseInput('{"weight":[1,1000000001]}'))
  assert.throws(() => parseInput('{"weight":[1,1.5]}'))
  assert.throws(() => parseInput('[1,2]'))
})

// Oracle: DP over every balanced subarray, with no greedy assumption.
function oracle(weight) {
  const n = weight.length
  const dp = new Array(n + 1).fill(0)
  for (let end = 1; end <= n; end++) {
    dp[end] = dp[end - 1]
    let max = 0
    for (let from = end - 1; from >= 0; from--) {
      max = Math.max(max, weight[from])
      if (weight[end - 1] < max) dp[end] = Math.max(dp[end], dp[from] + 1)
    }
  }
  return dp[n]
}

test('3638 random inputs match the DP oracle, and shipments are valid', () => {
  let seed = 3638
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 800; round++) {
    const weight = Array.from({ length: 2 + rnd(14) }, () => 1 + rnd(1 + rnd(9)))
    const run = buildTrace({ weight })
    assert.equal(run.result, oracle(weight), JSON.stringify(weight))
    const last = run.frames.at(-1)
    assert.equal(last.shipments.length, run.result)
    let previous = -1
    for (const s of last.shipments) {
      assert.ok(s.from > previous)
      const part = weight.slice(s.from, s.to + 1)
      assert.ok(part.at(-1) < Math.max(...part))
      previous = s.to
    }
  }
})

test('3638 frames map to real lines', () => {
  const lines = python.split('\n')
  const { frames } = buildTrace({ weight: [7, 2, 9, 9, 6, 3, 8, 1] })
  assert.equal(frames[0].phase, 'start')
  assert.equal(frames.at(-1).phase, 'done')
  for (const frame of frames) {
    assert.ok(code[frame.activeLine - 1], 'pseudocode line')
    assert.ok(lines[frame.pythonLine - 1]?.trim(), 'python line')
    assert.ok(frame.message.length > 0)
  }
  assert.ok(frames.some(f => f.phase === 'ship' && lines[f.pythonLine - 1].includes('count += 1')))
})
