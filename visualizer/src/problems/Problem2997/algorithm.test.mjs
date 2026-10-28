import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('2997 official examples', () => {
  assert.equal(solve([2, 1, 3, 4], 1), 2)
  assert.equal(solve([2, 0, 2, 0], 0), 0)
})

test('2997 edge cases: a single zero and a single value that must clear', () => {
  assert.equal(solve([0], 0), 0)
  assert.equal(solve([7], 0), 3)
})

test('2997 rejects an empty array and a value out of range', () => {
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
  assert.throws(() => parseInput('{"nums":[16],"k":1}'))
})

// Independent oracle: dynamic programming over the running XOR. Each element may become any value
// from 0 to 31, and the cost is the number of bits that change. Values above 31 are never needed.
function oracle(nums, k) {
  const INF = Infinity
  let dp = new Array(32).fill(INF)
  dp[0] = 0
  for (const a of nums) {
    const next = new Array(32).fill(INF)
    for (let s = 0; s < 32; s++) {
      if (dp[s] === INF) continue
      for (let v = 0; v < 32; v++) {
        let diff = a ^ v
        let cost = 0
        while (diff) { diff &= diff - 1; cost++ }
        const ns = s ^ v
        next[ns] = Math.min(next[ns], dp[s] + cost)
      }
    }
    dp = next
  }
  return dp[k]
}

test('2997 random arrays match an XOR-state dynamic programme', () => {
  let seed = 2997
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = []
    const len = 1 + rnd(6)
    for (let i = 0; i < len; i++) nums.push(rnd(16))
    const k = rnd(16)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
