import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2367 official examples', () => {
  assert.equal(solve('{"nums":[0,1,4,6,7,10],"diff":3}'), 2)
  assert.equal(solve('{"nums":[4,5,6,7,8,9],"diff":2}'), 2)
})

test('2367 a missing middle value gives no triplet', () => {
  assert.equal(solve('{"nums":[0,2,6],"diff":2}'), 0)
})

test('2367 rejects numbers that are not strictly increasing', () => {
  assert.throws(() => parseInput('{"nums":[1,1,2],"diff":1}'))
})

// Independent oracle: try every index triple i < j < k.
function oracle(nums, diff) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      for (let k = j + 1; k < nums.length; k++) {
        if (nums[j] - nums[i] === diff && nums[k] - nums[j] === diff) count++
      }
    }
  }
  return count
}

test('2367 random sequences match a triple-loop oracle', () => {
  let seed = 2367
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 300; round++) {
    const nums = []
    for (let v = 0; v <= 20 && nums.length < 12; v++) if (rnd(2) === 0) nums.push(v)
    while (nums.length < 3) nums.push(30 + nums.length * 7)
    const diff = 1 + rnd(6)
    assert.equal(solve(JSON.stringify({ nums, diff })), oracle(nums, diff), JSON.stringify({ nums, diff }))
  }
})
