import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = confirmations => buildTrace(parseInput(JSON.stringify({ confirmations }))).result
// Pairwise minutes check over the same rows, with the window measured in minutes.
const brute = rows => {
  const minutes = t => Date.parse(t.replace(' ', 'T') + 'Z') / 60000
  const users = new Set()
  for (const a of rows) for (const b of rows) {
    const d = minutes(b[1]) - minutes(a[1])
    if (a[0] === b[0] && d > 0 && d <= 1440) users.add(a[0])
  }
  return [...users].sort((a, b) => a - b)
}

test('1939 invented requests', () => {
  const rows = [
    [2, '2024-01-01 10:00:00', 'confirmed'],
    [2, '2024-01-02 10:00:00', 'timeout'],
    [3, '2024-01-01 12:00:00', 'confirmed'],
    [3, '2024-01-01 12:06:59', 'timeout'],
    [6, '2024-01-01 09:00:00', 'confirmed'],
    [6, '2024-01-03 09:01:00', 'timeout'],
  ]
  assert.deepEqual(solve(rows), [2, 3])
})

test('1939 matches minute-based pair check', () => {
  const rows = [
    [1, '2024-02-01 00:00:00', 'confirmed'], [1, '2024-02-01 23:59:00', 'timeout'], [1, '2024-02-03 00:00:00', 'confirmed'],
    [4, '2024-02-01 08:00:00', 'confirmed'], [4, '2024-02-02 08:00:00', 'timeout'],
    [5, '2024-02-05 10:00:00', 'confirmed'],
  ]
  assert.deepEqual(solve(rows), brute(rows))
})
