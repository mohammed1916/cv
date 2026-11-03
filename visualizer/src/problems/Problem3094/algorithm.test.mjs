import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = n => buildTrace(n).result
const pyLines = python.split('\n').length

function assertFrames(run) {
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine ${f.pythonLine}`)
  }
}

test('3094 authored examples', () => {
  assert.equal(solve(1024), 1024)
  assert.equal(solve(2 ** 30 - 1), 2 ** 30 - 1)
  assert.equal(solve(0), 0)
})

test('3094 rejects values outside the 30-bit range', () => {
  assert.throws(() => parseInput(String(2 ** 30)))
  assert.throws(() => parseInput('-1'))
  assert.equal(parseInput('37'), 37)
})

// Oracle: recover every value from 0 to 1023 and a spread of 30-bit values; the oracle mutates state exactly as the statement says.
test('3094 recovers the original number for many hidden values', () => {
  for (let n = 0; n <= 1023; n++) assert.equal(solve(n), n)
  for (let t = 0; t < 200; t++) {
    const n = Math.floor((t * 2654435761) % (2 ** 30))
    assert.equal(solve(n), n)
  }
  assertFrames(buildTrace(37))
})
