import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

test('example run gives the expected result and every frame maps to code', () => {
  const run = buildTrace(parseInput(`{"visits":[["ann",1,"home"],["ann",2,"shop"],["ann",3,"cart"],["bo",1,"home"],["bo",2,"shop"],["bo",4,"cart"],["cy",1,"shop"],["cy",2,"home"],["cy",3,"cart"]]}`))
  assert.deepEqual(run.result, ["home", "shop", "cart"])
  assert.ok(run.frames.length > 1)
  assert.ok(run.frames.every(f => f.pythonLine > 0 && f.activeLine > 0 && typeof f.message === 'string'))
})
