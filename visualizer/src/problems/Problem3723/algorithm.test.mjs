import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (num, sum) => buildTrace(parseInput(JSON.stringify({ num, sum }))).result

// Oracle: enumerate every num-digit number with the right digit sum, keep the best score, then the largest.
function oracle(num, sum) {
  let best = null; let bestScore = -1
  const lo = 10 ** (num - 1); const hi = 10 ** num
  for (let x = Math.max(lo, 1); x < hi; x++) {
    const digits = String(x).split('').map(Number)
    if (digits.reduce((a, b) => a + b, 0) !== sum) continue
    const score = digits.reduce((a, d) => a + d * d, 0)
    if (score > bestScore || (score === bestScore && x > Number(best))) { bestScore = score; best = String(x) }
  }
  return best === null ? '' : best
}

test('3723 invented examples', () => {
  assert.equal(solve(3, 20), '992')
  assert.equal(solve(2, 19), '')
})

test('3723 matches the enumeration oracle for small sizes', () => {
  for (let num = 1; num <= 3; num++) {
    for (let sum = 1; sum <= 9 * num; sum++) assert.equal(solve(num, sum), oracle(num, sum), `num ${num} sum ${sum}`)
  }
  assert.equal(solve(1, 10), '')
})
