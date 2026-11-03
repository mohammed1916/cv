import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent formula: the hands are |30h - 5.5m| degrees apart modulo 360, and the answer is the shorter way round.
function formula(hour, minutes) {
  const raw = Math.abs(30 * (hour % 12) - 5.5 * minutes) % 360
  return Math.min(raw, 360 - raw)
}

test('3:00 gives a right angle and 12:30 gives 165 degrees', () => {
  assert.equal(solve('3:00'), 90)
  assert.equal(solve('12:30'), 165)
})

test('hands coincide at 12:00 and form a straight angle at 6:00', () => {
  assert.equal(solve('12:00'), 0)
  assert.equal(solve('6:00'), 180)
})

test('fractional results from the hour hand are exact', () => {
  assert.equal(solve('3:15'), 7.5)
})

test('every time on the dial matches the independent formula', () => {
  for (let h = 1; h <= 12; h++) {
    for (let m = 0; m < 60; m++) {
      const text = `${h}:${String(m).padStart(2, '0')}`
      assert.equal(solve(text), formula(h, m), text)
    }
  }
})

test('the parser rejects malformed times', () => {
  assert.throws(() => parseInput('13:00'), /from 1 to 12/)
  assert.throws(() => parseInput('1:60'), /00 to 59/)
  assert.throws(() => parseInput('noon'), /Enter a time/)
})

test('frames use declared phases and finish with the answer', () => {
  const run = buildTrace({ hour: 9, minutes: 45 })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) assert.ok(ids.has(frame.phase) && frame.activeLine >= 1)
  assert.equal(run.frames.at(-1).snapshot.result, run.result)
})
