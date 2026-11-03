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

test('1321 keeps only dates with a full seven-day window', () => {
  const run = buildTrace(parseInput(JSON.stringify(sample)))
  assert.deepEqual(run.result, [
    { visited_on: '2026-01-07', amount: 280, average_amount: 40 },
    { visited_on: '2026-01-08', amount: 350, average_amount: 50 },
  ])
  checkFrames(run)
})

test('1321 rejects a payment with a fractional amount', () => {
  assert.throws(() => parseInput('{"Customer":[{"customer_id":1,"name":"A","visited_on":"2026-01-01","amount":1.5}]}'))
})
