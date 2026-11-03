import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

test('example run gives the expected result and every frame maps to code', () => {
  const run = buildTrace(parseInput(`{"ops":[["add",1,30],["add",2,50],["add",3,10],["top",2],["add",3,60],["top",2],["reset",2],["top",1]]}`))
  assert.deepEqual(run.result, [80, 120, 70])
  assert.ok(run.frames.length > 1)
  assert.ok(run.frames.every(f => f.pythonLine > 0 && f.activeLine > 0 && typeof f.message === 'string'))
})
