import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1701 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 9)
  assert.ok(python.includes('def averageWaitingTime'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1701 computes the averages by hand', () => {
  assert.ok(Math.abs(buildTrace(parseInput('[[2,4],[3,2],[9,1]]')).result - 10 / 3) < 1e-9)
  assert.ok(Math.abs(buildTrace(parseInput('[[1,1],[5,2]]')).result - 1.5) < 1e-9)
})

test('1701 rejects invalid input', () => {
  assert.throws(() => parseInput('[[0,1]]'))
  assert.throws(() => parseInput('[[1,0]]'))
})
