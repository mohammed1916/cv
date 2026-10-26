import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('703 official examples', () => {
  assert.deepEqual(buildTrace({ k: 3, nums: [4, 5, 8, 2], adds: [3, 5, 10, 9, 4] }).result, [4, 5, 5, 8, 8])
  assert.deepEqual(buildTrace({ k: 1, nums: [], adds: [-3, -2, -4, 0, 4] }).result, [-3, -2, -2, 0, 4])
})

// Oracle: after each add, sort the whole stream and read the kth largest.
test('703 random streams match sorting the whole stream', () => {
  let state = 111
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const k = 1 + rand(5)
    const nums = Array.from({ length: Math.max(0, k - 1 + rand(6)) }, () => rand(41) - 20)
    const adds = Array.from({ length: 1 + rand(8) }, () => rand(41) - 20)
    const stream = [...nums]
    const expected = adds.map(v => { stream.push(v); return [...stream].sort((a, b) => b - a)[k - 1] })
    assert.deepEqual(buildTrace({ k, nums, adds }).result, expected, JSON.stringify({ k, nums, adds }))
  }
})

test('703 rejects non-integer adds', () => {
  assert.throws(() => parseInput('{"k":1,"nums":[],"adds":[1.5]}'))
})
