import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1629 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 10)
  assert.ok(python.includes('def slowestKey'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1629 matches expected answers and ties', () => {
  assert.equal(buildTrace(parseInput('{"releaseTimes":[4,10,11,20],"keysPressed":"abca"}')).result, 'a')
  assert.equal(buildTrace(parseInput('{"releaseTimes":[1,3,6],"keysPressed":"hzy"}')).result, 'y')
  assert.equal(buildTrace(parseInput('{"releaseTimes":[2,4,5],"keysPressed":"mxm"}')).result, 'x')
})

test('1629 rejects invalid input', () => {
  assert.throws(() => parseInput('{"releaseTimes":[5,5],"keysPressed":"ab"}'))
  assert.throws(() => parseInput('{"releaseTimes":[1],"keysPressed":"A"}'))
})
