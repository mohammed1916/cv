import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const MOD = 1000000007
function reference(n, k, target) {
  let dp = Array(target + 1).fill(0)
  dp[0] = 1
  for (let i = 0; i < n; i++) {
    const next = Array(target + 1).fill(0)
    for (let s = 1; s <= target; s++) {
      for (let f = 1; f <= k; f++) if (s - f >= 0) next[s] = (next[s] + dp[s - f]) % MOD
    }
    dp = next
  }
  return dp[target]
}

test('three dice with two faces reaching sum four', () => {
  assert.equal(buildTrace(parseInput('[3,2,4]')).result, 3)
})

test('one die shows exactly its target face only', () => {
  assert.equal(buildTrace(parseInput('[1,6,3]')).result, 1)
  assert.equal(buildTrace(parseInput('[1,6,7]')).result, 0)
})

test('two dice reaching the largest sum', () => {
  assert.equal(buildTrace(parseInput('[2,3,6]')).result, 1)
})

test('unreachable target below the minimum sum', () => {
  assert.equal(buildTrace(parseInput('[4,3,3]')).result, 0)
})

test('matches the reference over the whole trace domain', () => {
  for (let n = 1; n <= 8; n++) for (const k of [1, 3, 8]) for (const t of [1, 5, 17, 40]) {
    assert.equal(buildTrace({ dice: n, faces: k, target: t }).result, reference(n, k, t), `${n} ${k} ${t}`)
  }
})

test('invalid inputs are rejected', () => {
  assert.throws(() => parseInput('[9,2,3]'), /Dice/)
  assert.throws(() => parseInput('[1,2]'), /three/)
  assert.throws(() => parseInput('nope'), /JSON/)
})

test('frames carry phases, code lines and snapshots', () => {
  const run = buildTrace({ dice: 2, faces: 2, target: 3 })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 7)
    assert.ok(frame.snapshot.prev.length === 4)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
