import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(phase => phase.id))

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

const sample = '{"Cities":[{"state":"Texas","city":"Dallas"},{"state":"Ohio","city":"Toledo"},{"state":"Texas","city":"Austin"},{"state":"Ohio","city":"Akron"},{"state":"Ohio","city":"Athens"}]}'
const run = text => buildTrace(parseInput(text))

test('3198 joins each state cities alphabetically', () => {
  assert.deepEqual(run(sample).result, [
    { state: 'Ohio', cities: 'Akron, Athens, Toledo' },
    { state: 'Texas', cities: 'Austin, Dallas' },
  ])
  assertFrames(run(sample))
})

test('3198 a single city gives a single name with no separator', () => {
  assert.deepEqual(run('{"Cities":[{"state":"Maine","city":"Bangor"}]}').result, [{ state: 'Maine', cities: 'Bangor' }])
})

test('3198 rejects a repeated state and city pair', () => {
  assert.throws(() => parseInput('{"Cities":[{"state":"Maine","city":"Bangor"},{"state":"Maine","city":"Bangor"}]}'))
})
