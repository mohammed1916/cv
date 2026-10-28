import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3309 official-style examples', () => {
  assert.equal(solve([1, 2, 3]), 30)
  assert.equal(solve([1, 1, 1]), 7)
})

test('3309 a list that is not three numbers is rejected', () => {
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: try all six orders and keep the largest binary value.
function oracle(nums) {
  let best = 0
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]
  for (const p of perms) {
    const value = parseInt(p.map(i => nums[i].toString(2)).join(''), 2)
    if (value > best) best = value
  }
  return best
}

test('3309 random triples match the permutation oracle', () => {
  let seed = 3309
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = [1 + rnd(127), 1 + rnd(127), 1 + rnd(127)]
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
