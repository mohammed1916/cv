import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

test('example run gives the expected result and every frame maps to code', () => {
  const run = buildTrace(parseInput(`{"n":15}`))
  assert.deepEqual(run.result, ["1", "2", "fizz", "4", "buzz", "fizz", "7", "8", "fizz", "buzz", "11", "fizz", "13", "14", "fizzbuzz"])
  assert.ok(run.frames.length > 1)
  assert.ok(run.frames.every(f => f.pythonLine > 0 && f.activeLine > 0 && typeof f.message === 'string'))
})
