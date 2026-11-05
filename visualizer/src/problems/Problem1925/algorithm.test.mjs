import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result
const brute = n => {
  let count = 0
  for (let a = 1; a <= n; a++) for (let b = 1; b <= n; b++) for (let c = 1; c <= n; c++) if (a * a + b * b === c * c) count++
  return count
}

test('1925 small invented bounds', () => {
  assert.equal(solve('5'), 2)
  assert.equal(solve('10'), 4)
})

test('1925 matches brute force', () => {
  for (let n = 1; n <= 12; n++) assert.equal(solve(String(n)), brute(n), `n=${n}`)
})
