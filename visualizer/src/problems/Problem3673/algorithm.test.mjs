import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('open sessions idle at least the threshold are zombies, in order', () => {
  const run = buildTrace(parseInput('{"now":600,"idle":30,"sessions":[{"session_id":"S101","last_active":540,"is_open":true},{"session_id":"S102","last_active":585,"is_open":true},{"session_id":"S103","last_active":500,"is_open":false},{"session_id":"S104","last_active":570,"is_open":true},{"session_id":"S105","last_active":300,"is_open":true}]}'))
  assert.deepEqual(run.result, ['S101', 'S104', 'S105'])
})

test('closed sessions are never zombies, however old', () => {
  const run = buildTrace(parseInput('{"now":120,"idle":60,"sessions":[{"session_id":"A1","last_active":100,"is_open":true},{"session_id":"B2","last_active":40,"is_open":false}]}'))
  assert.deepEqual(run.result, [])
  assert.equal(run.frames.at(-1).message, 'No zombie sessions.')
})

test('the threshold is inclusive and idle time is now minus last activity', () => {
  const run = buildTrace(parseInput('{"now":100,"idle":20,"sessions":[{"session_id":"X9","last_active":80,"is_open":true},{"session_id":"Y8","last_active":81,"is_open":true}]}'))
  assert.deepEqual(run.result, ['X9'])
  assert.ok(run.frames.every(f => typeof f.phase === 'string' && typeof f.activeLine === 'number' && typeof f.pythonLine === 'number' && typeof f.message === 'string' && 'row' in f))
})
