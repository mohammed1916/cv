import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

test('example run gives the expected result and every frame maps to code', () => {
  const run = buildTrace(parseInput(`{"ops":[["put",1,"2018:03:09:23:59:59"],["put",2,"2018:03:10:22:00:00"],["retrieve","2018:03:09:00:00:00","2018:03:10:23:59:59","Day"]]}`))
  assert.deepEqual(run.result, [1, 2])
  assert.ok(run.frames.length > 1)
  assert.ok(run.frames.every(f => f.pythonLine > 0 && f.activeLine > 0 && typeof f.message === 'string'))
})
