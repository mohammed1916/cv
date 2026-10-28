import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3925 official examples', () => {
  assert.deepEqual(solve([1, 2, 3]), [1, 2, 3, 3, 2, 1])
  assert.deepEqual(solve([1]), [1, 1])
})

test('3925 the output has length 2n and starts with the input', () => {
  assert.deepEqual(solve([5, 9]), [5, 9, 9, 5])
})

test('3925 rejects a value outside 1 to 100', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
})

// Independent oracle: the answer is the array followed by its reverse.
test('3925 random arrays match a concatenation oracle', () => {
  let seed = 3925
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(100))
    const reversed = [...nums].reverse()
    assert.deepEqual(solve(nums), [...nums, ...reversed], JSON.stringify(nums))
  }
})
