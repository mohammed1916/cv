import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(phase => phase.id))
const SAMPLE = JSON.stringify({ Emails: [
  { id: 1, email: 'Ana@Mail.com' }, { id: 2, email: 'ben@mail.com' }, { id: 3, email: 'cy@mail.org' },
  { id: 4, email: 'dee@corp.com' }, { id: 5, email: 'eli@mail.com' }, { id: 6, email: 'fay@corp.net' },
  { id: 7, email: 'gil@corp.com' },
] })

function assertFrames(trace) {
  assert.ok(trace.frames.length > 1)
  for (const frame of trace.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `unknown phase ${frame.phase}`)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.columns) && Array.isArray(frame.rows))
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

test('3059 counts .com addresses per lower-cased domain', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(trace.result, [
    { domain: 'corp.com', cnt: 2 },
    { domain: 'mail.com', cnt: 3 },
  ])
  assertFrames(trace)
})

test('3059 domains are compared without case', () => {
  const trace = buildTrace(parseInput('{"Emails":[{"id":1,"email":"A@X.COM"},{"id":2,"email":"b@x.com"}]}'))
  assert.deepEqual(trace.result, [{ domain: 'x.com', cnt: 2 }])
  assertFrames(trace)
})

test('3059 no .com addresses gives no rows', () => {
  const trace = buildTrace(parseInput('{"Emails":[{"id":1,"email":"x@y.org"}]}'))
  assert.deepEqual(trace.result, [])
  assertFrames(trace)
})
