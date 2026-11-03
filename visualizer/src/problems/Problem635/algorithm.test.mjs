import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

test('example run gives the expected result and every frame maps to code', () => {
  const run = buildTrace(parseInput(`{"ops":[["put",1,"2017:01:01:23:59:59"],["put",2,"2017:01:02:22:00:00"],["retrieve","2017:01:01:00:00:00","2017:01:02:23:59:59","Day"]]}`))
  assert.deepEqual(run.result, [1, 2])
  assert.ok(run.frames.length > 1)
  assert.ok(run.frames.every(f => f.pythonLine > 0 && f.activeLine > 0 && typeof f.message === 'string'))
})
