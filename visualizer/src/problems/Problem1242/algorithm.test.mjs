import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

test('example run gives the expected result and every frame maps to code', () => {
  const run = buildTrace(parseInput(`{"start":"http://ex.com/a","links":{"http://ex.com/a":["http://ex.com/b","http://other.org/c"],"http://ex.com/b":["http://ex.com/a","http://ex.com/d"],"http://ex.com/d":[]}}`))
  assert.deepEqual(run.result, ["http://ex.com/a", "http://ex.com/b", "http://ex.com/d"])
  assert.ok(run.frames.length > 1)
  assert.ok(run.frames.every(f => f.pythonLine > 0 && f.activeLine > 0 && typeof f.message === 'string'))
})
