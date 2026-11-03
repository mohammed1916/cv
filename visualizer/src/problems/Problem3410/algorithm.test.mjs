import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('removing the negative middle value joins the two positive pieces', () => {
  const input = parseInput(JSON.stringify({ nums: [1, -5, 4] }))
  assert.equal(buildTrace(input).result, 5)
})

test('an all-negative list keeps its largest single element', () => {
  const input = parseInput(JSON.stringify({ nums: [-4, -1, -2] }))
  assert.equal(buildTrace(input).result, -1)
})
