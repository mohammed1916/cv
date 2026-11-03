import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

test('example run gives the expected result and every frame maps to code', () => {
  const run = buildTrace(parseInput(`{"arrivals":[[1,1],[2,1],[3,3],[4,3],[5,1]]}`))
  assert.deepEqual(run.result, ["car 1 crosses on road 1", "car 2 crosses on road 1", "light switches to road 3", "car 3 crosses on road 3", "car 4 crosses on road 3", "light switches to road 1", "car 5 crosses on road 1"])
  assert.ok(run.frames.length > 1)
  assert.ok(run.frames.every(f => f.pythonLine > 0 && f.activeLine > 0 && typeof f.message === 'string'))
})
