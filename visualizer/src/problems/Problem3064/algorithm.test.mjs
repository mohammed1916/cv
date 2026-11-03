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

test('3064 authored examples', () => {
  assert.equal(solve(37), 37)
  assert.equal(solve(1024), 1024)
  assert.equal(solve(2 ** 30 - 1), 2 ** 30 - 1)
})

test('3064 rejects values outside 1 to 2^30 - 1', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput(String(2 ** 30)))
  assert.equal(parseInput('1'), 1)
})

// Oracle: the answer must equal the hidden number for every value in a range.
test('3064 recovers every small hidden number', () => {
  for (let n = 1; n <= 512; n++) assert.equal(solve(n), n)
  for (let t = 0; t < 100; t++) {
    const n = 1 + Math.floor(Math.random() * (2 ** 30 - 1))
    assert.equal(solve(n), n)
  }
  assertFrames(buildTrace(37))
})
