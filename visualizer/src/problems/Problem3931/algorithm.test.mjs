import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = text => buildTrace({ text }).result

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `pseudocode ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `python ${f.pythonLine}`)
    assert.ok(f.message.length > 0)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).ok, run.result)
}

test('3931 hand-checked cases', () => {
  assert.equal(solve('3142'), false)
  assert.equal(solve('5753'), true)
  assert.equal(solve('13'), true)
  assert.equal(solve('14'), false)
  assert.equal(solve('99'), true)
  assert.equal(solve('1212'), true)
  assert.equal(solve('0909'), false)
})

test('3931 frames are complete for the presets', () => {
  assertFrames(buildTrace({ text: '3142' }))
  assertFrames(buildTrace({ text: '5753' }))
})

test('3931 rejects bad input', () => {
  assert.throws(() => parseInput('7'))
  assert.throws(() => parseInput('12a'))
  assert.throws(() => parseInput('1'.repeat(101)))
})

test('3931 exhaustive two-digit and three-digit strings match the rule', () => {
  for (let a = 0; a < 100; a++) {
    const text = String(a).padStart(2, '0')
    const digits = [...text].map(Number)
    assert.equal(solve(text), Math.abs(digits[0] - digits[1]) <= 2, text)
  }
  for (let a = 0; a < 1000; a += 7) {
    const text = String(a).padStart(3, '0')
    const d = [...text].map(Number)
    const expected = Math.abs(d[0] - d[1]) <= 2 && Math.abs(d[1] - d[2]) <= 2
    assert.equal(solve(text), expected, text)
  }
})
