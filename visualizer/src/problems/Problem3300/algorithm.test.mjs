import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3300 official examples', () => {
  assert.equal(solve([10, 12, 13, 14]), 1)
  assert.equal(solve([1, 2, 3, 4]), 1)
  assert.equal(solve([999, 19, 199]), 10)
})

test('3300 a single number is its own digit sum', () => {
  assert.equal(solve([10000]), 1)
})

test('3300 rejects zero and non-integers', () => {
  assert.throws(() => parseInput('{"nums":[0]}'), /1 to 10000/)
  assert.throws(() => parseInput('{"nums":[1.5]}'), /integer/)
})

// Independent oracle: sum the decimal digits of the string form of each number.
function oracle(nums) {
  return Math.min(...nums.map(v => String(v).split('').reduce((sum, ch) => sum + Number(ch), 0)))
}

test('3300 random arrays match a string-digit oracle', () => {
  let seed = 3300
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(10000))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
