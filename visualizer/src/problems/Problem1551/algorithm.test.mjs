import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: every operation moves one unit between two values, so the answer is half the total distance from the mean.
function oracle(n) {
  const arr = Array.from({ length: n }, (_, i) => 2 * i + 1)
  const mean = arr.reduce((a, b) => a + b, 0) / n
  return arr.reduce((sum, v) => sum + Math.abs(v - mean), 0) / 2
}

test('small hand-checked values', () => {
  assert.equal(buildTrace(1).result, 0)
  assert.equal(buildTrace(3).result, 2)
  assert.equal(buildTrace(4).result, 4)
  assert.equal(buildTrace(6).result, 9)
})

test('every n up to 100 agrees with the distance oracle', () => {
  for (let n = 1; n <= 100; n++) assert.equal(buildTrace(n).result, oracle(n), `n=${n}`)
})

test('every frame points at real code and Python lines', () => {
  for (const frame of buildTrace(6).frames) {
    assert.ok(frame.activeLine >= 1, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
  }
})

test('malformed input is rejected', () => {
  assert.equal(parseInput('7'), 7)
  assert.throws(() => parseInput('0'), /1 to 100/)
  assert.throws(() => parseInput('101'), /1 to 100/)
  assert.throws(() => parseInput('x'), /integer/)
})
