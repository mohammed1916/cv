import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

test('example run gives the expected result and every frame maps to code', () => {
  const run = buildTrace(parseInput(`{"capacity":2,"ops":[["enqueue",1],["enqueue",2],["enqueue",3],["dequeue"],["enqueue",3],["dequeue"],["dequeue"],["dequeue"]]}`))
  assert.deepEqual(run.result, [null, null, null, 1, null, 2, 3, 3])
  assert.ok(run.frames.length > 1)
  assert.ok(run.frames.every(f => f.pythonLine > 0 && f.activeLine > 0 && typeof f.message === 'string'))
})
