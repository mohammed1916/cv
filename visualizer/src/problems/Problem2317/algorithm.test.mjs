import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2317 official examples', () => {
  assert.equal(solve([3, 2, 4, 6]), 7)
  assert.equal(solve([1, 2, 3, 9, 2]), 11)
})

test('2317 a lone zero stays zero', () => {
  assert.equal(solve([0]), 0)
})

test('2317 rejects a value above 15', () => {
  assert.throws(() => parseInput('{"nums":[16]}'))
})

// Independent oracle: an operation keeps any submask of a number, so try every submask for each element.
function oracle(nums) {
  let best = 0
  const pick = (i, xor) => {
    if (i === nums.length) { best = Math.max(best, xor); return }
    for (let m = 0; m <= nums[i]; m++) if ((m & nums[i]) === m) pick(i + 1, xor ^ m)
  }
  pick(0, 0)
  return best
}

test('2317 random arrays match a submask-enumeration oracle', () => {
  let seed = 2317
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(4)
    const nums = Array.from({ length: n }, () => rnd(16))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
