import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (times, targetFriend) => buildTrace(parseInput(JSON.stringify({ times, targetFriend }))).result
// Minute-level occupancy: at each moment free every chair whose friend left, then seat arrivals on the lowest empty chair.
const brute = (times, target) => {
  const seat = new Array(times.length).fill(-1)
  const occ = []
  const moments = [...new Set(times.flat())].sort((a, b) => a - b)
  for (const t of moments) {
    times.forEach(([a, l], i) => { if (l === t && seat[i] >= 0) occ[seat[i]] = false })
    times.forEach(([a], i) => {
      if (a === t) {
        let c = 0
        while (occ[c]) c++
        seat[i] = c
        occ[c] = true
      }
    })
  }
  return seat[target]
}

test('1942 invented friends', () => {
  assert.equal(solve([[1, 4], [2, 3], [4, 6]], 1), 1)
  assert.equal(solve([[1, 2], [2, 4], [3, 5]], 2), 1)
})

test('1942 matches minute-level occupancy simulation', () => {
  const cases = [
    [[[1, 4], [2, 3], [4, 6], [5, 9]], 3],
    [[[3, 10], [1, 5], [2, 6], [7, 8]], 3],
    [[[1, 3], [4, 6], [2, 5]], 2],
    [[[5, 7], [1, 2], [6, 9], [3, 4]], 2],
  ]
  for (const [t, f] of cases) assert.equal(solve(t, f), brute(t, f), JSON.stringify([t, f]))
})
