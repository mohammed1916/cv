import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2294 official examples', () => {
  assert.equal(solve({ nums: [3, 6, 1, 2, 5], k: 2 }), 2)
  assert.equal(solve({ nums: [1, 2, 3], k: 1 }), 2)
  assert.equal(solve({ nums: [2, 2, 4, 5], k: 0 }), 3)
})

test('2294 equal values can share a group even when k is 0', () => {
  assert.equal(solve({ nums: [7, 7, 7], k: 0 }), 1)
})

test('2294 rejects a negative k', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":-1}'))
})

// Independent oracle: assign each value to an existing group or a new one, keeping every group within k.
function oracle({ nums, k }) {
  let best = Infinity
  const groups = []
  const walk = i => {
    if (groups.length >= best) return
    if (i === nums.length) { best = groups.length; return }
    const x = nums[i]
    for (const g of groups) {
      const lo = Math.min(g.lo, x)
      const hi = Math.max(g.hi, x)
      if (hi - lo <= k) {
        const saved = { lo: g.lo, hi: g.hi }
        g.lo = lo
        g.hi = hi
        walk(i + 1)
        g.lo = saved.lo
        g.hi = saved.hi
      }
    }
    groups.push({ lo: x, hi: x })
    walk(i + 1)
    groups.pop()
  }
  walk(0)
  return best
}

test('2294 random arrays match a set-partition oracle', () => {
  let seed = 2294
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(7) }, () => rnd(20)), k: rnd(8) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
