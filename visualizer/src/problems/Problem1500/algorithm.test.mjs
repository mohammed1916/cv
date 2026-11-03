import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

test('example run gives the expected result and every frame maps to code', () => {
  const run = buildTrace(parseInput(`{"ops":[["join",[5,6]],["join",[6]],["request",2,5],["leave",1],["join",[8]],["request",2,6]]}`))
  assert.deepEqual(run.result, [1, 2, [1], null, 1, []])
  assert.ok(run.frames.length > 1)
  assert.ok(run.frames.every(f => f.pythonLine > 0 && f.activeLine > 0 && typeof f.message === 'string'))
})
