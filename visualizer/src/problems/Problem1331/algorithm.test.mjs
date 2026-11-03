import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = arr => buildTrace({ arr }).result

test('1331 sample inputs give the expected ranks', () => {
  assert.deepEqual(solve([40, 10, 20, 30]), [4, 1, 2, 3])
  assert.deepEqual(solve([5, 5, -3, 5, 0]), [3, 3, 1, 3, 2])
  assert.deepEqual(solve([7, -1, 7, 2]), [3, 1, 3, 2])
})

test('1331 an empty array stays empty', () => {
  assert.deepEqual(solve([]), [])
})

test('1331 rejects malformed input', () => {
  assert.throws(() => parseInput('{"a":1}'), /array/)
  assert.throws(() => parseInput('[1.5]'), /integer/)
  assert.throws(() => parseInput('[21]'), /-20 to 20/)
  assert.throws(() => parseInput('[1,2,3,4,5,6,7,8,9,10,11,12,13]'), /12/)
})

// Independent oracle: the rank of a value is one plus the number of distinct values strictly smaller than it.
test('1331 matches a count-of-smaller-distinct oracle on random arrays', () => {
  let seed = 5
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const len = rnd(13)
    const arr = Array.from({ length: len }, () => rnd(41) - 20)
    const expected = arr.map(v => 1 + new Set(arr.filter(w => w < v)).size)
    assert.deepEqual(solve(arr), expected, JSON.stringify(arr))
  }
})
