import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1602 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 9)
  assert.ok(python.includes('def findNearestRightNode'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1602 returns the right neighbour on the same level', () => {
  assert.equal(buildTrace(parseInput('{"tree":[5,3,8,1,4,null,9],"u":4}')).result, 9)
  assert.equal(buildTrace(parseInput('{"tree":[5,3,8,1,4,null,9],"u":3}')).result, 8)
  assert.equal(buildTrace(parseInput('{"tree":[5,3,8,1,4,null,9],"u":8}')).result, null)
  assert.equal(buildTrace(parseInput('{"tree":[5,3,8,1,4,null,9],"u":1}')).result, 4)
  assert.equal(buildTrace(parseInput('{"tree":[3,null,4,2],"u":2}')).result, null)
  assert.equal(buildTrace(parseInput('{"tree":[7],"u":7}')).result, null)
})

test('1602 rejects invalid input', () => {
  assert.throws(() => parseInput('{"tree":[1,1],"u":1}'))
  assert.throws(() => parseInput('{"tree":[1,2],"u":9}'))
  assert.throws(() => parseInput('{"tree":[null,2],"u":2}'))
})
