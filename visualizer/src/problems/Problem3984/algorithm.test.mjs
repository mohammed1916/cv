import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const MOD = 1000000007
const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result
const pyLineCount = python.trim().split('\n').length

// Independent oracle: every interval and every k, with the smallest k winning ties.
function oracle(nums) {
  let bestScore = null
  let bestK = null
  for (let k = 2; k <= Math.max(...nums) + 1; k++) {
    let kBest = null
    for (let i = 0; i < nums.length; i++) {
      let s = 0
      for (let j = i; j < nums.length; j++) {
        s += nums[j] % k === 0 ? nums[j] : -nums[j]
        if (kBest === null || s > kBest) kBest = s
      }
    }
    if (bestScore === null || kBest > bestScore) { bestScore = kBest; bestK = k }
  }
  return (((bestScore * bestK) % MOD) + MOD) % MOD
}

test('3984 hand-checked values', () => {
  // [4] is best with k = 2: score 4, times k = 8.
  assert.equal(solve([4]), 8)
  // [3, 5]: k = 5 scores 5 (only the 5 counts), beating k = 3 which scores 3.
  assert.equal(solve([3, 5]), 25)
  assert.equal(solve([6, 6, 6]), 6 * 3 * 2)
})

test('3984 rejects bad inputs', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[31]'))
  assert.throws(() => parseInput('[2.5]'))
  assert.throws(() => parseInput('{"nums":[1]}'))
})

test('3984 agrees with the brute-force oracle on random arrays', () => {
  let seed = 3984
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(12))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('3984 frame invariants hold', () => {
  const run = buildTrace(parseInput('[6, 4, 9, 10]'))
  assert.equal(run.frames[run.frames.length - 1].phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLineCount)
    assert.ok(frame.weights.length <= 4)
  }
  for (const frame of run.frames.filter(f => f.phase === 'keep')) assert.equal(frame.kBest, frame.bestScore)
})
