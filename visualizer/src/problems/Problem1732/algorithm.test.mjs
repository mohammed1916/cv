import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1732 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 6)
  assert.ok(python.includes('def largestAltitude'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1732 returns the maximum prefix sum including zero', () => {
  assert.equal(buildTrace(parseInput('[-3,4,-1,2,-5]')).result, 2)
  assert.equal(buildTrace(parseInput('[-2,-4]')).result, 0)
  assert.equal(buildTrace(parseInput('[5]')).result, 5)
})

test('1732 rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1.5]'))
})
