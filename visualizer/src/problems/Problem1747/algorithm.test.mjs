import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sql, code } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const sample = '[{"account_id":1,"ip_address":10,"login":1,"logout":5},{"account_id":1,"ip_address":20,"login":5,"logout":9},{"account_id":2,"ip_address":10,"login":1,"logout":4},{"account_id":2,"ip_address":20,"login":5,"logout":9},{"account_id":3,"ip_address":10,"login":2,"logout":8},{"account_id":3,"ip_address":10,"login":3,"logout":6},{"account_id":4,"ip_address":30,"login":1,"logout":10},{"account_id":4,"ip_address":40,"login":4,"logout":5},{"account_id":5,"ip_address":50,"login":1,"logout":2}]'

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.columns))
    assert.equal(typeof frame.message, 'string')
  }
}

test('touching endpoints flag accounts 1 and 4 but not 2, 3 or 5', () => {
  const trace = buildTrace(parseInput(sample))
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ account_id: 1 }, { account_id: 4 }])
})

test('same-IP sessions never flag an account', () => {
  const trace = buildTrace(parseInput('[{"account_id":7,"ip_address":1,"login":1,"logout":9},{"account_id":7,"ip_address":1,"login":2,"logout":3}]'))
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('parseInput rejects a login after its logout', () => {
  assert.throws(() => parseInput('[{"account_id":1,"ip_address":1,"login":5,"logout":2}]'))
  assert.ok(sql.includes('ORDER BY'))
})
