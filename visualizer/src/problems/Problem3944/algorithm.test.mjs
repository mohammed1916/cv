import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, costTo, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

// Oracle: choose final values inside a window around the inputs, and require the residue pattern directly.
function oracle(nums, k) {
  const n = nums.length
  const lo = Math.min(...nums) - k
  const hi = Math.max(...nums) + k
  let best = Infinity
  const y = Array(n).fill(0)
  const walk = i => {
    if (i === n) {
      const evens = y.filter((_, idx) => idx % 2 === 0).map(v => ((v % k) + k) % k)
      const odds = y.filter((_, idx) => idx % 2 === 1).map(v => ((v % k) + k) % k)
      if (!evens.every(r => r === evens[0])) return
      if (!odds.every(r => r === odds[0])) return
      if (odds.length && evens[0] === odds[0]) return
      best = Math.min(best, y.reduce((s, v, idx) => s + Math.abs(v - nums[idx]), 0))
      return
    }
    for (let v = lo; v <= hi; v += 1) { y[i] = v; walk(i + 1) }
  }
  walk(0)
  return best
}

test('3944 hand-checked presets', () => {
  assert.equal(solve([1, 1, 1, 1], 2), 2)
  assert.equal(solve([5, 8, 2, 9, 4, 7], 3), oracle([5, 8, 2, 9, 4, 7], 3))
})

test('3944 a single value only needs its own residue', () => {
  assert.equal(solve([7], 3), 0)
})

test('3944 costTo takes the shorter way around the cycle', () => {
  assert.equal(costTo(0, 2, 5), 2)
  assert.equal(costTo(0, 3, 5), 2)
  assert.equal(costTo(4, 0, 5), 1)
})

test('3944 parser rejects k below two', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":1}'))
})

test('3944 matches a bounded search oracle on tiny inputs', () => {
  let seed = 3944
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 80; t++) {
    const nums = Array.from({ length: 1 + rnd(4) }, () => rnd(7))
    const k = 2 + rnd(2)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
