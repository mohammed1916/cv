import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

// Independent oracle: every nonempty interval, both operations, then Kadane over the whole array.
function oracle(nums, k) {
  const n = nums.length
  let best = -Infinity
  for (const op of ['mul', 'div']) for (let l = 0; l < n; l++) for (let r = l; r < n; r++) {
    const arr = nums.map((x, i) => {
      if (i < l || i > r) return x
      return op === 'mul' ? x * k : Math.trunc(x / k)
    })
    for (let a = 0; a < n; a++) {
      let sum = 0
      for (let b = a; b < n; b++) { sum += arr[b]; best = Math.max(best, sum) }
    }
  }
  return best
}

test('3976 authored presets', () => {
  assert.equal(solve([-2, 5, -3, 4], 3), oracle([-2, 5, -3, 4], 3))
  assert.equal(solve([-4, -1, -6, 2], 2), oracle([-4, -1, -6, 2], 2))
})

test('3976 a single element must still be changed', () => {
  assert.equal(solve([5], 3), 15)
  assert.equal(solve([-5], 3), -1)
  assert.equal(solve([-5], 1), -5)
})

test('3976 truncation toward zero for divide', () => {
  assert.equal(solve([-7, 1], 2), oracle([-7, 1], 2))
  assert.equal(solve([7, -9, 3], 4), oracle([7, -9, 3], 4))
})

test('3976 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[],"k":2}'))
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
})

test('3976 random arrays match the interval-enumeration oracle', () => {
  let seed = 3976
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => rnd(41) - 20)
    const k = 1 + rnd(6)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
