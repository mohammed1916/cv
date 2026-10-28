import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1713 official examples', () => {
  assert.equal(solve({ target: [5, 1, 3], arr: [9, 4, 2, 3, 4] }), 2)
  assert.equal(solve({ target: [6, 4, 8, 1, 3, 2], arr: [4, 7, 6, 2, 3, 8, 6, 1] }), 3)
})

test('1713 no shared value needs every target value inserted', () => {
  assert.equal(solve({ target: [1, 2], arr: [3, 4] }), 2)
  assert.equal(solve({ target: [1, 2, 3], arr: [1, 2, 3] }), 0)
})

test('1713 rejects duplicate target values', () => {
  assert.throws(() => parseInput('{"target":[1,1],"arr":[1]}'))
})

// Independent oracle: longest common subsequence by dynamic programming, then target length minus that.
function oracle({ target, arr }) {
  const dp = Array.from({ length: arr.length + 1 }, () => Array(target.length + 1).fill(0))
  for (let i = 1; i <= arr.length; i++) {
    for (let j = 1; j <= target.length; j++) {
      dp[i][j] = arr[i - 1] === target[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }
  return target.length - dp[arr.length][target.length]
}

test('1713 random inputs match a longest-common-subsequence oracle', () => {
  let seed = 1713
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const pool = Array.from({ length: 10 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    const target = pool.slice(0, 1 + rnd(8))
    const arr = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(10))
    const input = { target, arr }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
