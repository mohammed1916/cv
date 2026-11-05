import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

test('example run gives the expected log and every frame maps to code', () => {
  const run = buildTrace(parseInput(`{"arrivals":[[1,1,1],[2,1,2],[3,2,3],[4,2,4],[5,1,1]]}`))
  assert.deepEqual(run.result, [
    'car 1 crosses on road 1 in direction 1',
    'car 2 crosses on road 1 in direction 2',
    'light turns green on road 2',
    'car 3 crosses on road 2 in direction 3',
    'car 4 crosses on road 2 in direction 4',
    'light turns green on road 1',
    'car 5 crosses on road 1 in direction 1',
  ])
  assert.ok(run.frames.length > 1)
  assert.ok(run.frames.every(f => f.pythonLine > 0 && f.activeLine > 0 && typeof f.message === 'string'))
})

test('directions on the same road share its green light', () => {
  const run = buildTrace(parseInput(`{"arrivals":[[1,2,3],[2,2,4],[3,1,2]]}`))
  assert.equal(run.result.filter(line => line.startsWith('light')).length, 2)
})

test('malformed arrivals are rejected', () => {
  assert.throws(() => parseInput(`{"arrivals":[[1,3,1]]}`), /roadId/)
  assert.throws(() => parseInput(`{"arrivals":[[1,1,3]]}`), /roadId 1 uses/)
})
