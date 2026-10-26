import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arr, target) => buildTrace(parseInput(JSON.stringify({ arr, target }))).result
function brute(arr, target) {
  let c = 0
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) for (let k = j + 1; k < arr.length; k++) if (arr[i] + arr[j] + arr[k] === target) c++
  return c
}
test('official examples', () => {
  assert.equal(solve([1, 1, 2, 2, 3, 3, 4, 4, 5, 5], 8), 20)
  assert.equal(solve([1, 1, 2, 2, 2, 2], 5), 12)
  assert.equal(solve([2, 1, 3], 6), 1)
})
test('matches O(n^3) brute force', () => {
  let seed = 51
  const rnd = m => (seed = (seed * 1103515245 + 12345) % 2147483648) % m
  for (let t = 0; t < 400; t++) {
    const arr = Array.from({ length: 3 + rnd(30) }, () => rnd(8))
    const target = rnd(22)
    assert.equal(solve(arr, target), brute(arr, target), JSON.stringify({ arr, target }))
  }
})
test('ends done, rejects bad input', () => {
  assert.equal(buildTrace(parseInput('{"arr":[1,2,3],"target":6}')).frames.at(-1).phase, 'done')
  assert.throws(() => parseInput('{"arr":[1,2],"target":3}'))
  assert.throws(() => parseInput('{"arr":[1,2,101],"target":3}'))
  assert.throws(() => parseInput('[1,2,3]'))
})
