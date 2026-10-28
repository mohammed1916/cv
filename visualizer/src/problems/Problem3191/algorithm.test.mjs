import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3191 official examples', () => {
  assert.equal(solve([0, 1, 1, 1]), -1)
  assert.equal(solve([0, 1, 1, 1, 0, 0]), 3)
})

test('3191 already all ones and a too-short array', () => {
  assert.equal(solve([1, 1]), 0)
  assert.equal(solve([0, 0]), -1)
})

test('3191 rejects a value other than 0 or 1', () => {
  assert.throws(() => parseInput('[0, 2, 1]'))
})

// Independent oracle: breadth-first search over every binary state, flipping any window of three.
function oracle(nums) {
  const n = nums.length
  let start = 0
  nums.forEach((v, i) => { if (v) start |= 1 << i })
  const goal = (1 << n) - 1
  const dist = new Map([[start, 0]])
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const mask = queue[head]
    if (mask === goal) return dist.get(mask)
    for (let i = 0; i + 2 < n; i++) {
      const next = mask ^ (0b111 << i)
      if (!dist.has(next)) {
        dist.set(next, dist.get(mask) + 1)
        queue.push(next)
      }
    }
  }
  return -1
}

test('3191 random arrays match a breadth-first oracle', () => {
  let seed = 3191
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(2))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
