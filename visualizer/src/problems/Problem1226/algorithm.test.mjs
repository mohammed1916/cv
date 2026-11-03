import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

test('example run gives the expected result and every frame maps to code', () => {
  const run = buildTrace(parseInput(`{"n":3,"events":[["hungry",0],["hungry",1],["hungry",2],["finish",0],["hungry",1],["finish",1],["hungry",2],["finish",2]]}`))
  assert.deepEqual(run.result, ["0 eats", "1 waits", "2 waits", "0 thinks", "1 eats", "1 thinks", "2 eats", "2 thinks"])
  assert.ok(run.frames.length > 1)
  assert.ok(run.frames.every(f => f.pythonLine > 0 && f.activeLine > 0 && typeof f.message === 'string'))
})
