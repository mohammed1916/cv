import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

test('example run gives the expected result and every frame maps to code', () => {
  const run = buildTrace(parseInput(`{"ops":[["add",7],["first"],["add",4],["first"],["add",7],["first"],["add",9],["first"]]}`))
  assert.deepEqual(run.result, [7, 7, 4, 4])
  assert.ok(run.frames.length > 1)
  assert.ok(run.frames.every(f => f.pythonLine > 0 && f.activeLine > 0 && typeof f.message === 'string'))
})
