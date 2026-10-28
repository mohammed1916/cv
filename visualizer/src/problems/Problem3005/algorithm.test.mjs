import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3005 official examples', () => {
  assert.equal(solve([1, 2, 2, 3, 1, 4]), 4)
  assert.equal(solve([1, 2, 3, 4, 5]), 5)
})

test('3005 a single value repeated', () => {
  assert.equal(solve([3, 3, 3]), 3)
})

test('3005 rejects an empty array and a value outside 1 to 5', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
})

// Independent oracle: for each element, count its occurrences by scanning the array.
function oracle(nums) {
  const freqOf = v => nums.filter(x => x === v).length
  const top = Math.max(...nums.map(freqOf))
  return nums.filter(v => freqOf(v) === top).length
}

test('3005 random arrays match a scan-every-element oracle', () => {
  let seed = 3005
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(5))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
