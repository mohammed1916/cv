import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('605 official examples', () => {
  assert.equal(buildTrace({ flowerbed: [1, 0, 0, 0, 1], n: 1 }).result, true)
  assert.equal(buildTrace({ flowerbed: [1, 0, 0, 0, 1], n: 2 }).result, false)
})

test('605 greedy answer equals the maximum-independent-set DP for small beds', () => {
  for (let len = 1; len <= 9; len++) for (let mask = 0; mask < 1 << len; mask++) {
    const bed = Array.from({ length: len }, (_, i) => (mask >> i) & 1)
    if (bed.some((v, i) => v === 1 && (bed[i - 1] === 1 || bed[i + 1] === 1))) continue
    // Oracle: best number of new flowers by DP over positions (take or skip, never adjacent).
    let take = 0, skip = 0
    for (let i = 0; i < len; i++) {
      const freeHere = bed[i] === 0 && (i === 0 || bed[i - 1] === 0) && (i === len - 1 || bed[i + 1] === 0)
      const newTake = freeHere ? skip + 1 : -Infinity
      const newSkip = Math.max(take, skip)
      take = newTake; skip = newSkip
    }
    const maxPlant = Math.max(take, skip, 0)
    for (let n = 0; n <= maxPlant + 1; n++) assert.equal(buildTrace({ flowerbed: bed, n }).result, n <= maxPlant, JSON.stringify({ bed, n }))
  }
})

test('605 rejects adjacent flowers in the input', () => {
  assert.throws(() => parseInput('{"flowerbed":[1,1],"n":0}'))
})
