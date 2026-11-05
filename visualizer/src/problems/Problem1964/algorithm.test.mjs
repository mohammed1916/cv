import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result
// O(n²) dynamic programming: best course ending at i, allowing equal heights.
const brute = a => a.map((_, i) => {
  let best = 1
  for (let j = 0; j < i; j++) if (a[j] <= a[i]) best = Math.max(best, 1 + (brute(a.slice(0, i)).at(j) ?? 0))
  return best
})
const dp = a => { const f = []; for (let i = 0; i < a.length; i++) { f[i] = 1; for (let j = 0; j < i; j++) if (a[j] <= a[i]) f[i] = Math.max(f[i], f[j] + 1) } return f }

test('1964 invented obstacles', () => {
  assert.deepEqual(solve([1, 2, 3, 2]), [1, 2, 3, 3])
  assert.deepEqual(solve([5, 1, 5, 5, 1]), [1, 1, 2, 3, 2])
})

test('1964 matches quadratic dynamic programming', () => {
  const cases = [[2, 2, 1], [3, 1, 4, 1, 5, 9, 2, 6], [7, 7, 7, 7], [1, 2, 3, 4, 5], [9, 8, 7, 6]]
  for (const c of cases) assert.deepEqual(solve(c), dp(c), JSON.stringify(c))
})
