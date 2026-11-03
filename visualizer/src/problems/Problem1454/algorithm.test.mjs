import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const PHASES = new Set(['load', 'scan', 'done'])

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

test('1454 keeps accounts with five consecutive login days, across a leap day', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    Accounts: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }, { id: 3, name: 'Carl' }],
    Logins: [
      { id: 1, login_date: '2020-01-01' }, { id: 1, login_date: '2020-01-02' }, { id: 1, login_date: '2020-01-03' },
      { id: 1, login_date: '2020-01-03' }, { id: 1, login_date: '2020-01-04' }, { id: 1, login_date: '2020-01-05' },
      { id: 2, login_date: '2020-01-01' }, { id: 2, login_date: '2020-01-02' }, { id: 2, login_date: '2020-01-03' },
      { id: 2, login_date: '2020-01-05' }, { id: 2, login_date: '2020-01-06' },
      { id: 3, login_date: '2020-02-27' }, { id: 3, login_date: '2020-02-28' }, { id: 3, login_date: '2020-02-29' },
      { id: 3, login_date: '2020-03-01' }, { id: 3, login_date: '2020-03-02' },
    ],
  })))
  assert.deepEqual(run.result, [{ id: 1, name: 'Alice' }, { id: 3, name: 'Carl' }])
  checkFrames(run)
})

test('1454 a gap of one day breaks the run', () => {
  const dates = ['2021-03-01', '2021-03-02', '2021-03-03', '2021-03-04', '2021-03-06']
  const run = buildTrace(parseInput(JSON.stringify({
    Accounts: [{ id: 9, name: 'Gap' }],
    Logins: dates.map(login_date => ({ id: 9, login_date })),
  })))
  assert.deepEqual(run.result, [])
  checkFrames(run)
})

test('1454 rejects a malformed date', () => {
  assert.throws(() => parseInput('{"Accounts":[],"Logins":[{"id":1,"login_date":"2020/01/01"}]}'))
})
