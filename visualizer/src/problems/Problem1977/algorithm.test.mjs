import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = s => buildTrace(parseInput(s)).result
// Enumerate every way to cut the digits into numbers without leading zeros that are non-decreasing.
const brute = s => {
  let count = 0
  const n = s.length
  const rec = (pos, prev) => {
    if (pos === n) { count++; return }
    for (let end = pos + 1; end <= n; end++) {
      const part = s.slice(pos, end)
      if (part[0] === '0') continue
      const value = BigInt(part)
      if (prev !== null && value < prev) continue
      rec(end, value)
    }
  }
  rec(0, null)
  return count
}

test('1977 invented digit strings', () => {
  assert.equal(solve('327'), 2)
  assert.equal(solve('0'), 0)
  assert.equal(solve('1'), 1)
  assert.equal(solve('11'), 2)
})

test('1977 matches exhaustive cuts', () => {
  for (const s of ['1234', '1111', '3210', '2020', '12345', '9999', '1003', '112112', '01234', '5555555']) assert.equal(solve(s), brute(s), s)
})
