import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2342 official examples', () => {
  assert.equal(solve('{"nums":[18,43,36,13,7]}'), 54)
  assert.equal(solve('{"nums":[10,12,19,14]}'), -1)
})

test('2342 the best partner is the largest earlier number with the same digit sum', () => {
  // Digit sum 6 appears as 15, 24, 33; the best pair is 33 + 24 = 57, not 15 + 33 = 48.
  assert.equal(solve('{"nums":[15,33,24]}'), 57)
})

test('2342 rejects a single number', () => {
  assert.throws(() => parseInput('{"nums":[5]}'))
})

// Independent oracle: compare every pair of numbers directly.
function oracle(nums) {
  const digitSum = n => String(n).split('').reduce((t, d) => t + Number(d), 0)
  let answer = -1
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (digitSum(nums[i]) === digitSum(nums[j])) answer = Math.max(answer, nums[i] + nums[j])
    }
  }
  return answer
}

test('2342 random numbers match an all-pairs oracle', () => {
  let seed = 2342
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 300; round++) {
    const nums = Array.from({ length: 2 + rnd(9) }, () => 1 + rnd(60))
    assert.equal(solve(JSON.stringify({ nums })), oracle(nums), JSON.stringify(nums))
  }
})
