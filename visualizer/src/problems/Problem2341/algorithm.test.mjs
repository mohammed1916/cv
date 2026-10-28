import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2341 official examples', () => {
  assert.deepEqual(solve([1, 3, 2, 1, 3, 2, 2]), [3, 1])
  assert.deepEqual(solve([1, 1]), [1, 0])
  assert.deepEqual(solve([0]), [0, 1])
})

test('2341 three equal values leave one value over', () => {
  assert.deepEqual(solve([5, 5, 5]), [1, 1])
})

test('2341 rejects out-of-range values and non-arrays', () => {
  assert.throws(() => parseInput('[21]'))
  assert.throws(() => parseInput('[-1]'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('"12"'))
})

// Independent oracle: keep removing any two equal values until none are left.
function oracle(nums) {
  const rest = [...nums]
  let pairs = 0
  let found = true
  while (found) {
    found = false
    outer: for (let i = 0; i < rest.length; i++) {
      for (let j = i + 1; j < rest.length; j++) {
        if (rest[i] === rest[j]) {
          rest.splice(j, 1)
          rest.splice(i, 1)
          pairs++
          found = true
          break outer
        }
      }
    }
  }
  return [pairs, rest.length]
}

test('2341 random arrays match a remove-a-pair oracle', () => {
  let seed = 2341
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rnd(16) }, () => rnd(6))
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
