import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2637 teaching model examples', () => {
  assert.equal(buildTrace(parseInput('{"delay":40,"limit":60,"value":"done"}')).result, 'done')
  assert.equal(buildTrace(parseInput('{"delay":90,"limit":60,"value":"late"}')).result, 'Time Limit Exceeded')
  assert.equal(buildTrace(parseInput('{"delay":60,"limit":60,"value":"edge"}')).frames.at(-1).outcome, 'resolved')
})
