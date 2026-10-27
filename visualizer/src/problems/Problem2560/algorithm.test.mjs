import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: try every subset of houses, keep the ones with no two adjacent and at least k robbed, minimise the largest value.
function oracle({ nums, k }) {
  let best = Infinity
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    let ok = true
    let count = 0
    let top = 0
    for (let i = 0; i < nums.length; i++) {
      if (!((mask >> i) & 1)) continue
      if (i > 0 && (mask >> (i - 1)) & 1) { ok = false; break }
      count++
      top = Math.max(top, nums[i])
    }
    if (ok && count >= k) best = Math.min(best, top)
  }
  return best
}

test('2560 official examples', () => {
  assert.equal(solve({ nums: [2, 3, 5, 9], k: 2 }), 5)
  assert.equal(solve({ nums: [2, 7, 9, 3, 1], k: 2 }), 2)
})

test('2560 a single house and a full alternating choice', () => {
  assert.equal(solve({ nums: [4], k: 1 }), 4)
  assert.equal(solve({ nums: [9, 1, 9, 1, 9], k: 3 }), 9)
})

test('2560 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"k":3}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
  assert.throws(() => parseInput('{"nums":[21],"k":1}'))
})

test('2560 random houses match a subset oracle', () => {
  let seed = 2560
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => 1 + rnd(20))
    const k = 1 + rnd(Math.ceil(n / 2))
    assert.equal(solve({ nums, k }), oracle({ nums, k }), JSON.stringify({ nums, k }))
  }
})
