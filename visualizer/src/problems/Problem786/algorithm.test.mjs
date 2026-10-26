import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const brute = (arr, k) => {
  const all = []
  for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) all.push([arr[i], arr[j]])
  all.sort((a, b) => a[0] * b[1] - b[0] * a[1])
  return all[k - 1]
}
test('official examples', () => {
  assert.deepEqual(buildTrace({ arr: [1, 2, 3, 5], k: 3 }).result, [2, 5])
  assert.deepEqual(buildTrace({ arr: [1, 7], k: 1 }).result, [1, 7])
})
test('matches sorted brute force', () => {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]
  for (let t = 0; t < 300; t++) {
    const arr = [1, ...primes.filter(() => Math.random() < 0.5)]
    if (arr.length < 2) continue
    const total = arr.length * (arr.length - 1) / 2
    const k = 1 + Math.floor(Math.random() * total)
    const run = buildTrace(parseInput(JSON.stringify({ arr, k })))
    assert.deepEqual(run.result, brute(arr, k))
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('{"arr":[1,4],"k":1}'))
  assert.throws(() => parseInput('{"arr":[1,2,3],"k":4}'))
  assert.throws(() => parseInput('{"arr":[2,3],"k":1}'))
})
