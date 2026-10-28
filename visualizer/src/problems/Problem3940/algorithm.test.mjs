import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3940 official examples', () => {
  assert.deepEqual(solve([1, 1, 1, 2, 2, 3], 2), [1, 1, 2, 2, 3])
  assert.deepEqual(solve([1, 2, 3], 1), [1, 2, 3])
})

test('3940 k equal to the length keeps everything', () => {
  assert.deepEqual(solve([4, 4, 4], 3), [4, 4, 4])
})

test('3940 rejects an unsorted array', () => {
  assert.throws(() => parseInput('{"nums":[2,1],"k":1}'), /sorted/)
})

// Independent oracle: for each value, take its first k occurrences by position.
function oracle(nums, k) {
  return nums.filter((x, i) => nums.slice(0, i).filter(y => y === x).length < k)
}

test('3940 random sorted arrays match a first-k-occurrences oracle', () => {
  let seed = 3940
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(10)
    const nums = Array.from({ length: len }, () => 1 + rnd(10)).sort((a, b) => a - b)
    const k = 1 + rnd(len)
    assert.deepEqual(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
