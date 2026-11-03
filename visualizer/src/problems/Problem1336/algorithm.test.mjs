import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, sample } from './algorithm.js'

function checkFrames(run) {
  const lineCount = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(phases.some(phase => phase.id === frame.phase), `unknown phase ${frame.phase}`)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lineCount)
    assert.ok(frame.message.length > 0)
    assert.ok(Array.isArray(frame.view.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}


test('1336 counts same-day transactions and fills empty histogram buckets', () => {
  const run = buildTrace(parseInput(JSON.stringify(sample)))
  assert.deepEqual(run.result, [
    { transactions_count: 0, visits_count: 1 },
    { transactions_count: 1, visits_count: 2 },
    { transactions_count: 2, visits_count: 1 },
  ])
  checkFrames(run)
})

test('1336 keeps a bucket that has no visits in the middle', () => {
  const run = buildTrace(parseInput('{"Visits":[{"user_id":1,"visit_date":"2020-01-01"}],"Transactions":[{"user_id":1,"transaction_date":"2020-01-01","amount":1},{"user_id":1,"transaction_date":"2020-01-01","amount":2}]}'))
  assert.deepEqual(run.result, [
    { transactions_count: 0, visits_count: 0 },
    { transactions_count: 1, visits_count: 0 },
    { transactions_count: 2, visits_count: 1 },
  ])
})
