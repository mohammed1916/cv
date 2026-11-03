import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const sample = JSON.stringify({
  UserActivity: [
    { username: 'mia', activity: 'chess', startDate: '2026-01-02', endDate: '2026-01-05' },
    { username: 'mia', activity: 'rowing', startDate: '2026-01-10', endDate: '2026-01-12' },
    { username: 'mia', activity: 'choir', startDate: '2026-02-01', endDate: '2026-02-03' },
    { username: 'lee', activity: 'climbing', startDate: '2026-03-04', endDate: '2026-03-09' },
    { username: 'ray', activity: 'yoga', startDate: '2026-01-20', endDate: '2026-01-22' },
    { username: 'ray', activity: 'swim', startDate: '2026-01-03', endDate: '2026-01-06' },
  ],
})

function checkFrames(run) {
  const phaseIds = phases.map(p => p.id)
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(phaseIds.includes(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.split('\n').length)
    assert.ok(Array.isArray(f.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('1369 sample returns the second most recent activity per user', () => {
  const run = buildTrace(parseInput(sample))
  assert.deepEqual(run.result, [
    { username: 'lee', activity: 'climbing', startDate: '2026-03-04', endDate: '2026-03-09' },
    { username: 'mia', activity: 'rowing', startDate: '2026-01-10', endDate: '2026-01-12' },
    { username: 'ray', activity: 'swim', startDate: '2026-01-03', endDate: '2026-01-06' },
  ])
  checkFrames(run)
})

test('1369 a user with one activity returns that activity', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    UserActivity: [{ username: 'solo', activity: 'run', startDate: '2026-05-01', endDate: '2026-05-02' }],
  })))
  assert.deepEqual(run.result, [{ username: 'solo', activity: 'run', startDate: '2026-05-01', endDate: '2026-05-02' }])
  checkFrames(run)
})

test('1369 rejects overlapping activities for one user', () => {
  assert.throws(() => parseInput(JSON.stringify({
    UserActivity: [
      { username: 'a', activity: 'x', startDate: '2026-01-01', endDate: '2026-01-10' },
      { username: 'a', activity: 'y', startDate: '2026-01-05', endDate: '2026-01-12' },
    ],
  })))
})
