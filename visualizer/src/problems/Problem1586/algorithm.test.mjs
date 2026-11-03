import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

test('example run gives the expected result and every frame maps to code', () => {
  const run = buildTrace(parseInput(`{"values":[2,5,9,12,20],"ops":["next","hasNext","next","next","prev","hasPrevious","next","next","hasNext"]}`))
  assert.deepEqual(run.result, [2, true, 5, 9, 5, true, 9, 12, true])
  assert.ok(run.frames.length > 1)
  assert.ok(run.frames.every(f => f.pythonLine > 0 && f.activeLine > 0 && typeof f.message === 'string'))
})
