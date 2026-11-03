import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['resident', 'participate', 'average', 'done'])

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(PHASES.has(f.phase), f.phase)
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows) && Array.isArray(f.columns))
  }
  assert.deepEqual(run.frames.at(-1).rows, run.result)
}

const sample = {
  Person: [
    { id: 1, name: 'Ali', phone_number: '212-555-0101' },
    { id: 2, name: 'Bea', phone_number: '212-555-0199' },
    { id: 3, name: 'Chen', phone_number: '972-50-1234' },
    { id: 4, name: 'Dona', phone_number: '51-998-3333' },
  ],
  Country: [
    { name: 'Morocco', country_code: '212' },
    { name: 'Israel', country_code: '972' },
    { name: 'Peru', country_code: '51' },
  ],
  Calls: [
    { caller_id: 1, callee_id: 2, duration: 20 },
    { caller_id: 1, callee_id: 3, duration: 30 },
    { caller_id: 3, callee_id: 4, duration: 40 },
  ],
}

test('1501 keeps countries whose participant average beats the overall average', () => {
  // Morocco: 20 + 20 + 30 over 3 sides = 23.33; Israel: 30 + 40 over 2 = 35; Peru: 40 over 1 = 40; overall 30.
  const run = buildTrace(parseInput(JSON.stringify(sample)))
  assert.deepEqual(run.result, [{ country: 'Israel' }, { country: 'Peru' }])
  checkFrames(run)
})

test('1501 a call between two residents of one country counts twice for that country', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    Person: [{ id: 1, name: 'A', phone_number: '212-1' }, { id: 2, name: 'B', phone_number: '212-2' }],
    Country: [{ name: 'Morocco', country_code: '212' }],
    Calls: [{ caller_id: 1, callee_id: 2, duration: 10 }],
  })))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

test('1501 a non-resident prefix is ignored', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    Person: [{ id: 1, name: 'A', phone_number: '999-1' }],
    Country: [{ name: 'Peru', country_code: '51' }],
    Calls: [],
  })))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})
