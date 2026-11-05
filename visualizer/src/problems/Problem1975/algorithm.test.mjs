import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = m => buildTrace(parseInput(JSON.stringify(m))).result
// Exhaustive search over all sign patterns reachable by flipping edge-adjacent pairs is equivalent to any sign pattern with the same parity of negatives.
const brute = m => {
  const cells = m.flat()
  let best = -Infinity
  const n = cells.length
  for (let mask = 0; mask < 1 << n; mask++) {
    let neg = 0
    for (let i = 0; i < n; i++) if (mask & (1 << i)) neg++
    if (neg % 2 !== (cells.filter(v => v < 0).length % 2)) continue
    let sum = 0
    for (let i = 0; i < n; i++) sum += mask & (1 << i) ? -Math.abs(cells[i]) : Math.abs(cells[i])
    best = Math.max(best, sum)
  }
  return best
}

test('1975 invented matrices', () => {
  assert.equal(solve([[3, -1, 2], [-4, 5, 0], [1, -2, 6]]), 24)
  assert.equal(solve([[2, -3], [-5, 4]]), 14)
  assert.equal(solve([[-1, 2], [3, -4]]), 10)
})

test('1975 matches parity-restricted search on 2 by 2 matrices', () => {
  const cases = [[[1, -1], [-1, 1]], [[-2, 9], [4, -7]], [[5, 5], [-5, 0]], [[-3, -3], [-3, 2]]]
  for (const m of cases) assert.equal(solve(m), brute(m), JSON.stringify(m))
})
