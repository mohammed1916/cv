import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function reference(y, m, d) {
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let total = d
  for (let i = 0; i < m - 1; i++) total += days[i]
  return total
}

test('first and last days of a common year', () => {
  assert.equal(buildTrace(parseInput('2023-01-01')).result, 1)
  assert.equal(buildTrace(parseInput('2023-12-31')).result, 365)
})

test('leap day in a leap year and March after it', () => {
  assert.equal(buildTrace(parseInput('2024-02-29')).result, 60)
  assert.equal(buildTrace(parseInput('2024-03-01')).result, 61)
})

test('century years without a leap day', () => {
  assert.equal(buildTrace(parseInput('1900-03-01')).result, 60)
  assert.equal(buildTrace(parseInput('2000-03-01')).result, 61)
})

test('matches the reference for every month start across several years', () => {
  for (const y of [1900, 1996, 2000, 2023, 2024, 2100]) {
    for (let m = 1; m <= 12; m++) {
      const input = { year: y, month: m, day: 1 }
      const text = `${y}-${String(m).padStart(2, '0')}-01`
      assert.equal(buildTrace(parseInput(text)).result, reference(y, m, 1), text)
    }
  }
})

test('invalid dates are rejected', () => {
  assert.throws(() => parseInput('2023-02-29'), /day/)
  assert.throws(() => parseInput('2023-13-01'), /month/)
  assert.throws(() => parseInput('hello'), /YYYY-MM-DD/)
})

test('every frame has a phase, a valid code line and narration', () => {
  const run = buildTrace(parseInput('2024-07-15'))
  for (const frame of run.frames) {
    assert.ok(['start', 'inspect', 'update', 'done'].includes(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 6)
    assert.ok(frame.message.length > 5)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
