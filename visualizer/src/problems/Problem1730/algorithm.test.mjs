import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1730 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 2)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 11)
  assert.ok(python.includes('def getFood'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1730 finds the shortest distance to food', () => {
  assert.equal(buildTrace(parseInput(examples[0].input)).result, 2)
  assert.equal(buildTrace(parseInput(examples[1].input)).result, -1)
  assert.equal(buildTrace(parseInput('["*O#"]')).result, 2)
  assert.equal(buildTrace(parseInput('["*","#"]'.replace('"*","#"', '"*#"'))).result, 1)
})

test('1730 rejects invalid grids', () => {
  assert.throws(() => parseInput('["O#"]'))
  assert.throws(() => parseInput('["*O","O"]'))
})
