import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1612 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 8)
  assert.ok(python.includes('def checkEquivalence'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1612 matches the expected answers', () => {
  assert.equal(buildTrace(parseInput('{"root1":["+","x","+",null,null,"y","z"],"root2":["+","+","z","y","x"]}')).result, true)
  assert.equal(buildTrace(parseInput('{"root1":["+","x","+",null,null,"y","z"],"root2":["+","+","z","y","y"]}')).result, false)
  assert.equal(buildTrace(parseInput('{"root1":["x"],"root2":["x"]}')).result, true)
})

test('1612 rejects invalid trees', () => {
  assert.throws(() => parseInput('{"root1":["+","a"],"root2":["x"]}'))
  assert.throws(() => parseInput('{"root1":["x"],"root2":["A"]}'))
})
