import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, popcount } from './algorithm.js'

const solve = (m, k, nums) => buildTrace({ m, k, nums }).result

test('3539 hand-computed cases', () => {
  // only [0, 0]: 1 + 1 = 2 has one set bit, product 6 * 6
  assert.equal(solve(2, 1, [6]), 36)
  // [0, 0] gives 16 and [1, 1] gives 49; [0, 1] and [1, 0] have two set bits
  assert.equal(solve(2, 1, [4, 7]), 65)
  // [0, 1] and [1, 0] each multiply 4 * 7
  assert.equal(solve(2, 2, [4, 7]), 56)
  // two 0s and one 1 sum to 4, in 3 orders, product 2 * 2 * 3
  assert.equal(solve(3, 1, [2, 3]), 36)
  assert.equal(solve(1, 1, [9]), 9)
  // three copies of index 0 sum to 3, which has two set bits
  assert.equal(solve(3, 1, [5]), 0)
  assert.equal(solve(3, 2, [5]), 125)
})

test('3539 popcount', () => {
  assert.equal(popcount(0), 0)
  assert.equal(popcount(1), 1)
  assert.equal(popcount(6), 2)
  assert.equal(popcount(7), 3)
})

// Oracle: enumerate all n^m sequences directly.
function oracle(m, k, nums) {
  const MOD = 1000000007n
  let answer = 0n
  const walk = (position, sum, product) => {
    if (position === m) {
      if (popcount(sum) === k) answer = (answer + product) % MOD
      return
    }
    nums.forEach((value, index) => walk(position + 1, sum + 2 ** index, (product * BigInt(value)) % MOD))
  }
  walk(0, 0, 1n)
  return Number(answer)
}

test('3539 agrees with enumerating every sequence', () => {
  let seed = 12345
  const random = limit => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % limit }
  for (let trial = 0; trial < 150; trial++) {
    const n = 1 + random(5), m = 1 + random(6), k = 1 + random(m)
    const big = trial % 3 === 0
    const nums = Array.from({ length: n }, () => 1 + random(big ? 100000000 : 9))
    assert.equal(solve(m, k, nums), oracle(m, k, nums), JSON.stringify({ m, k, nums }))
  }
})

test('3539 parser', () => {
  assert.doesNotThrow(() => parseInput('{"m":1,"k":1,"nums":[1]}'))
  assert.throws(() => parseInput('{"m":2,"k":3,"nums":[1]}'))
  assert.throws(() => parseInput('{"m":0,"k":1,"nums":[1]}'))
  assert.throws(() => parseInput('{"m":7,"k":1,"nums":[1]}'))
  assert.throws(() => parseInput('{"m":1,"k":1,"nums":[0]}'))
  assert.throws(() => parseInput('{"m":1,"k":1,"nums":[]}'))
  assert.throws(() => parseInput('[1]'))
})

test('3539 frames map to executed lines and stay bounded', () => {
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  const { frames } = buildTrace({ m: 3, k: 2, nums: [2, 3, 5] })
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(pyLines[frame.pythonLine - 1]?.trim())
    assert.ok(frame.message)
  }
  assert.match(pyLines[frames.find(f => f.phase === 'state').pythonLine - 1], /following\[key\]/)
  assert.match(pyLines[frames.at(-1).pythonLine - 1], /return answer/)
  assert.equal(frames.at(-1).answer, buildTrace({ m: 3, k: 2, nums: [2, 3, 5] }).result)
  const largest = buildTrace({ m: 6, k: 3, nums: [1, 2, 3, 4, 5, 6] }).frames.length
  assert.ok(largest < 1500, `frame count ${largest}`)
})

test('3539 the first expansion row carries correctly', () => {
  const state = buildTrace({ m: 3, k: 3, nums: [2, 3] }).frames.find(f => f.phase === 'state')
  assert.deepEqual(state.transitions[3], { t: 3, choose: 1, total: 3, low: 1, nextCarry: 1, newBits: 1, pruned: false, gain: 8 })
})
