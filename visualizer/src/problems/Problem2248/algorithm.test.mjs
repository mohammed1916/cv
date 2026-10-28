import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2248 official example', () => {
  assert.deepEqual(solve([[3, 1, 2, 4, 5], [1, 2, 3, 4], [3, 4, 5, 6]]), [3, 4])
})

test('2248 an empty intersection and a single array', () => {
  assert.deepEqual(solve([[1, 2], [3, 4]]), [])
  assert.deepEqual(solve([[9, 2, 5]]), [2, 5, 9])
})

test('2248 rejects repeated values and out-of-range values', () => {
  assert.throws(() => parseInput('[[1,1]]'), /distinct/)
  assert.throws(() => parseInput('[[51]]'))
})

// Independent oracle: keep the values of the first array that every other array contains.
function oracle(nums) {
  const [first, ...rest] = nums
  return first.filter(v => rest.every(arr => arr.includes(v))).sort((a, b) => a - b)
}

test('2248 random arrays match a membership oracle', () => {
  let seed = 2248
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(5)
    const nums = []
    for (let a = 0; a < count; a++) {
      const pool = Array.from({ length: 12 }, (_, i) => i + 1)
      const size = 1 + rnd(6)
      const arr = []
      for (let k = 0; k < size; k++) arr.push(pool.splice(rnd(pool.length), 1)[0])
      nums.push(arr)
    }
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
