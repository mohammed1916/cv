import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(nums).result
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

// Independent oracle: dynamic programming over every split point.
function oracle(nums) {
  const n = nums.length
  const INF = Infinity
  const dp = Array(n + 1).fill(INF)
  dp[0] = 0
  for (let i = 1; i <= n; i++) {
    let g = 0
    for (let j = i - 1; j >= 0; j--) {
      g = gcd(g, nums[j])
      if (g > 1 && dp[j] + 1 < dp[i]) dp[i] = dp[j] + 1
    }
  }
  return dp[n] === INF ? -1 : dp[n]
}

test('2436 teaching examples', () => {
  assert.equal(solve([6, 10, 15, 7, 9]), 4)
  assert.equal(solve([12, 18, 1, 8]), -1)
  assert.equal(solve([5, 7, 11]), 3)
})

test('2436 a single element is its own subarray', () => {
  assert.equal(solve([4]), 1)
  assert.equal(solve([1]), -1)
})

test('2436 parseInput validates the list', () => {
  assert.deepEqual(parseInput('[2,3]'), [2, 3])
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0,2]'))
  assert.throws(() => parseInput('[61]'))
})

test('2436 random inputs match the dynamic programming oracle', () => {
  let seed = 2436
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => (rnd(10) === 0 ? 1 : 2 + rnd(20)))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('2436 frame invariants hold on every trace', () => {
  const nums = [6, 10, 15, 7, 9]
  const run = buildTrace(nums)
  const phases = new Set(['start', 'extend', 'cut', 'impossible', 'done'])
  for (const f of run.frames) {
    assert.ok(phases.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.trim().split('\n').length)
  }
  const last = run.frames.at(-1)
  assert.equal(last.count, run.result)
  const covered = last.segments.reduce((sum, s) => sum + (s.end - s.start + 1), 0)
  assert.equal(covered, nums.length)
})
