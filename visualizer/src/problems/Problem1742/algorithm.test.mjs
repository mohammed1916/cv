import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1742 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 6)
  assert.ok(python.includes('def countBalls'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1742 counts balls per digit-sum box', () => {
  assert.equal(buildTrace({ lowLimit: 5, highLimit: 15 }).result, 2)
  assert.equal(buildTrace({ lowLimit: 1, highLimit: 10 }).result, 2)
  assert.equal(buildTrace({ lowLimit: 1, highLimit: 1 }).result, 1)
  assert.equal(buildTrace({ lowLimit: 1, highLimit: 19 }).result, 2)
})

test('1742 rejects invalid ranges', () => {
  assert.throws(() => parseInput('{"lowLimit":5,"highLimit":4}'))
  assert.throws(() => parseInput('{"lowLimit":0,"highLimit":4}'))
})
