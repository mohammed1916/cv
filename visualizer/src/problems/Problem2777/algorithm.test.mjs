import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const dates = (start, end, step) => buildTrace(parseInput(JSON.stringify({ start, end, step }))).result
const PY = python.split('\n')

test('2777 worked examples', () => {
  assert.deepEqual(dates('2023-04-01', '2023-04-04', 1), ['2023-04-01', '2023-04-02', '2023-04-03', '2023-04-04'])
  assert.deepEqual(dates('2023-01-30', '2023-02-05', 3), ['2023-01-30', '2023-02-02', '2023-02-05'])
})

test('2777 start after end yields nothing', () => {
  assert.deepEqual(dates('2023-05-02', '2023-05-01', 1), [])
})

test('2777 frames point at real python lines', () => {
  for (const f of buildTrace({ start: '2024-02-27', end: '2024-03-01', step: 1 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

// Oracle: a month-by-month calendar count, independent of the millisecond arithmetic above.
test('2777 leap-year ranges match a calendar oracle', () => {
  const days = [] // all days from 2024-02-27 to 2024-03-02 inclusive
  for (const d of ['2024-02-27', '2024-02-28', '2024-02-29', '2024-03-01', '2024-03-02']) days.push(d)
  for (let step = 1; step <= 3; step++) {
    const expected = days.filter((_, i) => i % step === 0)
    assert.deepEqual(dates('2024-02-27', '2024-03-02', step), expected, `step ${step}`)
  }
})
