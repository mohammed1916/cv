import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.columns))
    assert.equal(typeof frame.message, 'string')
  }
}

test('2339 sample gives six ordered pairs with no self pairs', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { home_team: 'Eagles', away_team: 'Lions' },
    { home_team: 'Eagles', away_team: 'Tigers' },
    { home_team: 'Lions', away_team: 'Eagles' },
    { home_team: 'Lions', away_team: 'Tigers' },
    { home_team: 'Tigers', away_team: 'Eagles' },
    { home_team: 'Tigers', away_team: 'Lions' },
  ])
})

test('2339 a single team has no matches', () => {
  const trace = run('{"Teams":[{"team_name":"Solo"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('2339 rejects duplicate team names', () => {
  assert.throws(() => parseInput('{"Teams":[{"team_name":"A"},{"team_name":"A"}]}'))
})
