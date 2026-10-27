import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: decide each bit separately. A bit is set when some even number has it set.
function oracle(nums) {
  const evens = nums.filter(x => x % 2 === 0)
  let answer = 0
  for (let bit = 0; bit < 8; bit++) {
    if (evens.some(x => (x >> bit) & 1)) answer += 2 ** bit
  }
  return answer
}

test('3688 official-style examples', () => {
  assert.equal(solve({ nums: [1, 2, 4, 5, 6] }), 6)
  assert.equal(solve({ nums: [1, 3, 5] }), 0)
  assert.equal(solve({ nums: [8] }), 8)
})

test('3688 rejects a value of zero', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
})

test('3688 random lists match a per-bit oracle', () => {
  let seed = 3688
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(100))
    assert.equal(solve({ nums }), oracle(nums), JSON.stringify(nums))
  }
})
