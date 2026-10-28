import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3107 official examples', () => {
  assert.equal(solve({ nums: [2, 5, 6, 8, 5], k: 4 }), 2)
  assert.equal(solve({ nums: [2, 5, 6, 8, 5], k: 7 }), 3)
  assert.equal(solve({ nums: [1, 2, 3, 4, 5, 6], k: 4 }), 0)
})

test('3107 a single number moves straight to k', () => {
  assert.equal(solve({ nums: [7], k: 3 }), 4)
})

test('3107 rejects a missing k and an empty list', () => {
  assert.throws(() => parseInput('{"nums": [1, 2]}'))
  assert.throws(() => parseInput('{"nums": [], "k": 3}'))
})

// Independent oracle: try every target multiset of values from 1 to D and keep the cheapest one whose median is k.
function oracle({ nums, k }) {
  const n = nums.length
  const D = Math.max(k, ...nums)
  let best = Infinity
  const targets = new Array(n).fill(1)
  const check = () => {
    const sorted = [...targets].sort((a, b) => a - b)
    if (sorted[Math.floor(n / 2)] !== k) return
    let cost = 0
    for (let i = 0; i < n; i++) cost += Math.abs(targets[i] - nums[i])
    best = Math.min(best, cost)
  }
  const fill = pos => {
    if (pos === n) { check(); return }
    for (let v = 1; v <= D; v++) { targets[pos] = v; fill(pos + 1) }
  }
  fill(0)
  return best
}

test('3107 random lists match a try-every-target oracle', () => {
  let seed = 3107
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const nums = Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(6))
    const k = 1 + rnd(6)
    assert.equal(solve({ nums, k }), oracle({ nums, k }), JSON.stringify({ nums, k }))
  }
})
