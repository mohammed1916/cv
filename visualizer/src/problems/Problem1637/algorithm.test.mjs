import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1637 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 6)
  assert.ok(python.includes('def maxWidthOfVerticalArea'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1637 returns the widest x gap', () => {
  assert.equal(buildTrace(parseInput('{"points":[[2,5],[6,1],[9,3],[4,8]]}')).result, 3)
  assert.equal(buildTrace(parseInput('{"points":[[3,1],[3,7],[10,2]]}')).result, 7)
  assert.equal(buildTrace(parseInput('{"points":[[5,5],[5,9]]}')).result, 0)
})

test('1637 rejects invalid input', () => {
  assert.throws(() => parseInput('{"points":[[1,2]]}'))
  assert.throws(() => parseInput('{"points":[[1,2,3],[4,5]]}'))
})
