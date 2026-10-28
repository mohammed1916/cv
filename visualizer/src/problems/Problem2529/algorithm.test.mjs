import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2529 official examples', () => {
  assert.equal(solve({ nums: [-2, -1, -1, 1, 2, 3] }), 3)
  assert.equal(solve({ nums: [-3, -2, -1, 0, 0, 1, 2] }), 3)
  assert.equal(solve({ nums: [5, 20, 66, 1314] }), 4)
})

test('2529 zeros count as neither sign', () => {
  assert.equal(solve({ nums: [0, 0, 0] }), 0)
})

test('2529 rejects unsorted input', () => {
  assert.throws(() => parseInput('{"nums":[1,0]}'))
})

// Independent oracle: count the signs directly.
function oracle({ nums }) {
  const positive = nums.filter(v => v > 0).length
  const negative = nums.filter(v => v < 0).length
  return Math.max(positive, negative)
}

test('2529 random sorted arrays match a direct count', () => {
  let seed = 2529
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(21) - 10).sort((a, b) => a - b)
    assert.equal(solve({ nums }), oracle({ nums }), JSON.stringify(nums))
  }
})
