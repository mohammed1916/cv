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

const SAMPLE = '{"Coordinates":[{"X":1,"Y":2},{"X":2,"Y":1},{"X":3,"Y":3},{"X":4,"Y":4},{"X":4,"Y":4},{"X":5,"Y":6},{"X":6,"Y":5},{"X":7,"Y":8},{"X":9,"Y":9}]}'
const run = text => buildTrace(parseInput(text))

test('2978 keeps each symmetric pair once and repeated diagonal points', () => {
  assert.deepEqual(run(SAMPLE).result, [{ X: 1, Y: 2 }, { X: 4, Y: 4 }, { X: 5, Y: 6 }])
  assertFrames(run(SAMPLE))
})

test('2978 drops a lone diagonal point', () => {
  const lone = '{"Coordinates":[{"X":3,"Y":3}]}'
  assert.deepEqual(run(lone).result, [])
  assertFrames(run(lone))
})

test('2978 rejects a non-integer coordinate', () => {
  assert.throws(() => parseInput('{"Coordinates":[{"X":1.5,"Y":2}]}'))
})
