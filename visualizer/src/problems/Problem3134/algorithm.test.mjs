import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: list the distinct count of every subarray, sort, and take the lower median.
function oracle({ nums }) {
  const values = []
  for (let i = 0; i < nums.length; i++) {
    const seen = new Set()
    for (let j = i; j < nums.length; j++) {
      seen.add(nums[j])
      values.push(seen.size)
    }
  }
  values.sort((a, b) => a - b)
  return values[Math.floor((values.length - 1) / 2)]
}

test('3134 official examples', () => {
  assert.equal(solve({ nums: [1, 2, 3] }), 1)
  assert.equal(solve({ nums: [3, 4, 3, 4, 5] }), 2)
  assert.equal(solve({ nums: [4, 3, 5, 4] }), 2)
})

test('3134 a single element and a constant array', () => {
  assert.equal(solve({ nums: [7] }), 1)
  assert.equal(solve({ nums: [2, 2, 2, 2] }), 1)
})

test('3134 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[9]}'))
})

test('3134 random arrays match a list-of-subarrays oracle', () => {
  let seed = 3134
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(8))
    assert.equal(solve({ nums }), oracle({ nums }), JSON.stringify(nums))
  }
})
