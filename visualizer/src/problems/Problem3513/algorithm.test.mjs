import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: enumerate every index triple i <= j <= k and collect the distinct XOR values.
function oracle(nums) {
  const seen = new Set()
  const n = nums.length
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      for (let k = j; k < n; k++) seen.add(nums[i] ^ nums[j] ^ nums[k])
    }
  }
  return seen.size
}

test('3513 small permutations', () => {
  assert.equal(solve({ nums: [1] }), 1)
  assert.equal(solve({ nums: [1, 2] }), 2)
  assert.equal(solve({ nums: [1, 2, 3] }), 4)
  assert.equal(solve({ nums: [1, 2, 3, 4] }), 8)
})

test('3513 rejects a list that is not a permutation', () => {
  assert.throws(() => parseInput('{"nums":[1,1,3]}'))
})

test('3513 random permutations match a triple-enumeration oracle', () => {
  let seed = 3513
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const nums = Array.from({ length: n }, (_, i) => i + 1)
    for (let i = n - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[nums[i], nums[j]] = [nums[j], nums[i]]
    }
    assert.equal(solve({ nums }), oracle(nums), JSON.stringify(nums))
  }
})
