import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result
const brute = arr => {
  const n = arr.length
  let count = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    const seq = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) seq.push(arr[i])
    let stage = 0, ok = true
    const counts = [0, 0, 0]
    for (const v of seq) {
      if (v < stage) { ok = false; break }
      stage = v
      counts[v]++
    }
    if (ok && counts[0] && counts[1] && counts[2]) count++
  }
  return count
}

test('1955 invented sequences', () => {
  assert.equal(solve([0, 1, 2]), 1)
  assert.equal(solve([0, 1, 2, 2]), 3)
  assert.equal(solve([2, 1, 0]), 0)
})

test('1955 matches exhaustive subsequence count', () => {
  const cases = [[0, 1, 2, 2], [0, 0, 1, 1, 2], [0, 1, 1, 2, 0, 2], [2, 0, 1, 2, 1, 0, 2], [0, 0, 0, 1, 2, 2]]
  for (const c of cases) assert.equal(solve(c), brute(c), JSON.stringify(c))
})
