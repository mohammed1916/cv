import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3761 official examples', () => {
  assert.equal(solve([12, 21, 45, 33, 54]), 1)
  assert.equal(solve([120, 21]), 1)
  assert.equal(solve([21, 120]), -1)
})

test('3761 the closest of several mirror pairs wins', () => {
  assert.equal(solve([12, 5, 21, 21]), 2)
})

test('3761 rejects a zero value', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
})

// Independent oracle: try every pair i < j and test reverse(nums[i]) === nums[j].
function oracle(nums) {
  let best = -1
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (Number(String(nums[i]).split('').reverse().join('')) === nums[j]) {
        if (best === -1 || j - i < best) best = j - i
      }
    }
  }
  return best
}

let seed = 3761
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3761 seeded random against pair oracle', () => {
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(60))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
