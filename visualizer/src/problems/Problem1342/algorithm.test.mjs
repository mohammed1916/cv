import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = num => buildTrace(num).result

// Independent closed form: halving removes one bit each time, and each set bit except the top one costs one subtraction.
function closedForm(n) {
  if (n === 0) return 0
  const bits = n.toString(2)
  const ones = [...bits].filter(b => b === '1').length
  return (bits.length - 1) + ones
}

test('sample value 14 takes six steps', () => {
  assert.equal(solve(14), 6)
})

test('zero needs no steps', () => {
  assert.equal(solve(0), 0)
})

test('a power of two halves down to one, then takes one final subtraction', () => {
  assert.equal(solve(64), 7)
  assert.equal(solve(1), 1)
})

test('values match the closed form for every number up to 2000', () => {
  for (let n = 0; n <= 2000; n++) assert.equal(solve(n), closedForm(n), String(n))
})

test('the parser accepts a plain integer and rejects anything else', () => {
  assert.equal(parseInput(' 123 '), 123)
  assert.throws(() => parseInput('-4'), /nonnegative/)
  assert.throws(() => parseInput('2.5'), /nonnegative/)
  assert.throws(() => parseInput('2000000'), /at most/)
})

test('frames use declared phases and the final frame is done', () => {
  const run = buildTrace(10)
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) assert.ok(ids.has(frame.phase) && frame.message.length > 10)
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).snapshot.result, closedForm(10))
})
