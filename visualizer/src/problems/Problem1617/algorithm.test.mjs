import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python, pythonLineMap } from './algorithm.js'

test('1617 examples, code and python are well formed', () => {
  assert.ok(examples.length >= 3)
  for (const example of examples) {
    const run = buildTrace(parseInput(example.input))
    assert.equal(run.frames.at(-1).phase, 'done')
    for (const frame of run.frames) assert.ok(phases.some(p => p.id === frame.phase))
  }
  assert.equal(code.length, 9)
  assert.ok(python.includes('def countSubgraphsForEachDiameter'))
  assert.equal(Object.keys(pythonLineMap).length, code.length)
})

test('1617 matches the expected counts', () => {
  assert.deepEqual(buildTrace(parseInput('{"n":4,"edges":[[1,2],[2,3],[3,4]]}')).result, [3, 2, 1])
  assert.deepEqual(buildTrace(parseInput('{"n":2,"edges":[[2,1]]}')).result, [1])
  assert.deepEqual(buildTrace(parseInput('{"n":3,"edges":[[3,1],[1,2]]}')).result, [2, 1])
})

test('1617 rejects invalid input', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[1,2],[1,2]]}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[1,2]]}'))
})
