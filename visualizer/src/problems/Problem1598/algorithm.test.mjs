import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1598 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames[0].phase, 'start')
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 7)
  assert.ok(python.includes('def minOperations'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1598 matches the expected answers', () => {
  assert.equal(buildTrace(parseInput('["m1/","n2/","./","m3/","../","x9/","../","../"]')).result, 1)
  assert.equal(buildTrace(parseInput('["a/","../","../","b/"]')).result, 1)
  assert.equal(buildTrace(parseInput('["k1/","k2/","../","../","../"]')).result, 0)
})

test('1598 rejects invalid input', () => {
  for (const bad of ['[]', '"d1/"', '["D1/"]', '["d1"]']) assert.throws(() => parseInput(bad))
})
