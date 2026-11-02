import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3721 worked examples', () => {
  assert.equal(solve([1, 2, 3, 4]), 4)
  assert.equal(solve([1, 1, 1]), 0)
  assert.equal(solve([1, 2, 2]), 3)
  assert.equal(solve([2]), 0)
  assert.equal(solve([2, 5, 4, 3, 8]), 4)
})

test('3721 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[0]}'))
})

function oracle(nums) {
  let best = 0
  for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) {
    const part = nums.slice(i, j + 1)
    const ev = new Set(part.filter(v => v % 2 === 0))
    const od = new Set(part.filter(v => v % 2 !== 0))
    if (ev.size === od.size) best = Math.max(best, part.length)
  }
  return best
}

test('3721 random arrays match a from-scratch oracle', () => {
  let seed = 3721
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(7))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
