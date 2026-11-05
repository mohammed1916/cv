import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (dist, speed) => buildTrace(parseInput(JSON.stringify({ dist, speed }))).result
// Minute-by-minute simulation: at each minute the nearest remaining monster is shot, a loss happens when one has arrived.
const brute = (dist, speed) => {
  const arrive = dist.map((d, i) => Math.ceil(d / speed[i]))
  let alive = arrive.map((t, i) => i)
  let killed = 0
  for (let minute = 0; ; minute++) {
    if (alive.some(i => arrive[i] <= minute)) return killed
    if (alive.length === 0) return killed
    alive.sort((a, b) => arrive[a] - arrive[b])
    alive.shift()
    killed++
  }
}

test('1921 invented monsters', () => {
  assert.equal(solve([1, 3, 4], [1, 1, 1]), 3)
  assert.equal(solve([1, 1, 2, 3], [1, 1, 1, 1]), 1)
  assert.equal(solve([5], [2]), 1)
})

test('1921 matches minute simulation', () => {
  const cases = [[[4, 2, 7], [1, 1, 2]], [[3, 3, 3, 9], [1, 2, 3, 1]], [[10, 20, 30], [5, 5, 5]], [[1, 2], [1, 1]]]
  for (const [d, s] of cases) assert.equal(solve(d, s), brute(d, s), JSON.stringify([d, s]))
})
