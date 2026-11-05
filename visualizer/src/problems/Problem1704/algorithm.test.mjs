import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1704 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 6)
  assert.ok(python.includes('def halvesAreAlike'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1704 compares the vowel counts of the two halves', () => {
  assert.equal(buildTrace('lemonade').result, true)
  assert.equal(buildTrace('ouchat').result, false)
  assert.equal(buildTrace('AbCdEf').result, true)
})

test('1704 rejects odd lengths and non-letters', () => {
  assert.throws(() => parseInput('"abc"'))
  assert.throws(() => parseInput('"ab1d"'))
})
