import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

// Independent oracle: full minimax over every legal deletion (contiguous, shorter than the array).
function game(arr, aliceTurn) {
  if (arr.length === 1) return arr[0]
  const outcomes = []
  for (let i = 0; i < arr.length; i++) {
    for (let j = i; j < arr.length; j++) {
      if (j - i + 1 >= arr.length) continue
      outcomes.push(game([...arr.slice(0, i), ...arr.slice(j + 1)], !aliceTurn))
    }
  }
  return aliceTurn ? Math.max(...outcomes) : Math.min(...outcomes)
}

test('3828 official examples', () => {
  assert.equal(solve([1, 5, 2]), 2)
  assert.equal(solve([3, 7]), 7)
})

test('3828 a single element is the final element', () => {
  assert.equal(solve([9]), 9)
})

test('3828 rejects an empty array and a zero value', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[0,3]}'))
})

test('3828 random arrays match the minimax oracle', () => {
  let seed = 3828
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(9))
    assert.equal(solve(nums), game(nums, true), JSON.stringify(nums))
  }
})
