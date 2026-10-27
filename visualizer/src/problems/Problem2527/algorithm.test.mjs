import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2527 official examples', () => {
  assert.equal(solve([1, 4]), 5)
  assert.equal(solve([15, 45, 20, 2, 34, 35, 5, 44, 32, 30]), 34)
})

test('2527 rejects more than twelve entries here', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3,4,5,6,7,8,9,10,11,12,13]}'))
})

// Independent oracle: evaluate the effective value of every ordered triple and xor them all.
function oracle(nums) {
  let beauty = 0
  for (const a of nums) for (const b of nums) for (const c of nums) beauty ^= (a & b) | c
  return beauty
}

test('2527 random arrays match the triple-enumeration oracle', () => {
  let seed = 2527
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => rnd(16))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
