import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: enumerate every way to pick p disjoint index pairs and keep the best largest gap.
function oracle({ nums, p }) {
  const n = nums.length
  let best = Infinity
  const go = (used, count, top) => {
    if (top >= best) return
    if (count === p) {
      best = top
      return
    }
    let first = 0
    while (first < n && (used >> first) & 1) first++
    if (first >= n) return
    go(used | (1 << first), count, top)
    for (let j = first + 1; j < n; j++) {
      if ((used >> j) & 1) continue
      go(used | (1 << first) | (1 << j), count + 1, Math.max(top, Math.abs(nums[j] - nums[first])))
    }
  }
  go(0, 0, 0)
  return best
}

test('2616 official examples', () => {
  assert.equal(solve({ nums: [10, 1, 2, 7, 1, 3], p: 2 }), 1)
  assert.equal(solve({ nums: [4, 2, 1, 2], p: 1 }), 0)
})

test('2616 no pairs and a single forced pair', () => {
  assert.equal(solve({ nums: [5, 9], p: 0 }), 0)
  assert.equal(solve({ nums: [5, 9], p: 1 }), 4)
})

test('2616 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1],"p":0}'))
  assert.throws(() => parseInput('{"nums":[1,2,3],"p":2}'))
  assert.throws(() => parseInput('{"nums":[1,31],"p":1}'))
})

test('2616 random arrays match a pair-enumeration oracle', () => {
  let seed = 2616
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(6)
    const nums = Array.from({ length: n }, () => rnd(20))
    const p = rnd(Math.floor(n / 2) + 1)
    assert.equal(solve({ nums, p }), oracle({ nums, p }), JSON.stringify({ nums, p }))
  }
})
