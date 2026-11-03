import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const PHASES = phases.map(phase => phase.id)

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASES.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(frame.message.length > 0)
    assert.ok(Array.isArray(frame.table.columns) && Array.isArray(frame.table.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).table.rows, run.result)
}

const SAMPLE = JSON.stringify({
  as_of: '2026-06-30',
  logins: [
    { customer_id: 1, login_date: '2026-06-20' }, { customer_id: 1, login_date: '2026-06-28' },
    { customer_id: 2, login_date: '2026-05-01' }, { customer_id: 2, login_date: '2026-05-10' },
    { customer_id: 3, login_date: '2026-05-31' }, { customer_id: 3, login_date: '2026-06-01' },
    { customer_id: 4, login_date: '2026-04-30' }, { customer_id: 6, login_date: '2026-05-31' },
  ],
})

test('sample keeps the three customers idle for 30 days or more', () => {
  // Customer 4: 61 idle days; customer 2: 51 (latest login May 10); customer 6: 30. Customers 1 and 3 are under 30.
  const run = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(run.result, [
    { customer_id: 4, last_login: '2026-04-30', days_idle: 61 },
    { customer_id: 2, last_login: '2026-05-10', days_idle: 51 },
    { customer_id: 6, last_login: '2026-05-31', days_idle: 30 },
  ])
  checkFrames(run)
})

test('a login exactly 29 days before the as-of date is not at risk', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    as_of: '2026-06-30', logins: [{ customer_id: 3, login_date: '2026-06-01' }],
  })))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

test('rejects a login after the as-of date and an impossible date', () => {
  assert.throws(() => parseInput(JSON.stringify({
    as_of: '2026-06-30', logins: [{ customer_id: 1, login_date: '2026-07-01' }],
  })))
  assert.throws(() => parseInput(JSON.stringify({
    as_of: '2026-02-30', logins: [{ customer_id: 1, login_date: '2026-01-01' }],
  })))
})
