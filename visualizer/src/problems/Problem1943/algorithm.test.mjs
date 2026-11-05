import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = segments => buildTrace(parseInput(JSON.stringify(segments))).result
// Unit-by-unit painting: sum the colours over each unit cell, then merge equal neighbouring positive sums.
const brute = segments => {
  const lo = Math.min(...segments.map(s => s[0])), hi = Math.max(...segments.map(s => s[1]))
  const cells = []
  for (let x = lo; x < hi; x++) {
    let sum = 0
    for (const [s, e, c] of segments) if (x >= s && x < e) sum += c
    cells.push([x, sum])
  }
  const out = []
  for (const [x, sum] of cells) {
    if (sum === 0) continue
    const last = out[out.length - 1]
    if (last && last[1] === x && last[2] === sum) last[1] = x + 1
    else out.push([x, x + 1, sum])
  }
  return out
}

test('1943 invented painting', () => {
  assert.deepEqual(solve([[1, 4, 5], [1, 7, 7]]), [[1, 4, 12], [4, 7, 7]])
  assert.deepEqual(solve([[1, 3, 2], [4, 6, 9]]), [[1, 3, 2], [4, 6, 9]])
})

test('1943 matches unit-by-unit painting', () => {
  const cases = [
    [[1, 4, 5], [4, 6, 7], [2, 5, 3]],
    [[1, 7, 9], [3, 5, 2], [4, 8, 4]],
    [[1, 2, 1], [2, 3, 2], [3, 4, 4]],
    [[5, 9, 3], [2, 6, 8], [1, 3, 6]],
  ]
  for (const c of cases) assert.deepEqual(solve(c), brute(c), JSON.stringify(c))
})
