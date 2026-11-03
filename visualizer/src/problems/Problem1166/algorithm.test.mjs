import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

test('example run gives the expected result and every frame maps to code', () => {
  const run = buildTrace(parseInput(`{"ops":[["create","/a",1],["create","/a/b",2],["get","/a/b"],["create","/x/y",3],["create","/a",4],["get","/q"]]}`))
  assert.deepEqual(run.result, [true, true, 2, false, false, -1])
  assert.ok(run.frames.length > 1)
  assert.ok(run.frames.every(f => f.pythonLine > 0 && f.activeLine > 0 && typeof f.message === 'string'))
})
