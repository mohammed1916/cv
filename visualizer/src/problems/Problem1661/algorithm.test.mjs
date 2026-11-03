import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"activity":[{"machine_id":0,"process_id":0,"activity_type":"start","timestamp":2},{"machine_id":0,"process_id":0,"activity_type":"end","timestamp":9},{"machine_id":0,"process_id":1,"activity_type":"start","timestamp":4},{"machine_id":0,"process_id":1,"activity_type":"end","timestamp":12},{"machine_id":1,"process_id":0,"activity_type":"start","timestamp":1},{"machine_id":1,"process_id":0,"activity_type":"end","timestamp":4},{"machine_id":1,"process_id":1,"activity_type":"start","timestamp":2},{"machine_id":1,"process_id":1,"activity_type":"end","timestamp":4},{"machine_id":1,"process_id":2,"activity_type":"start","timestamp":5},{"machine_id":1,"process_id":2,"activity_type":"end","timestamp":11}]}'
const EXPECTED = [
  { machine_id: 0, processing_time: 7.5 },
  { machine_id: 1, processing_time: 3.667 },
]

test('1661 averages each machine over its paired processes', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1661 frame invariants hold', () => {
  const { frames } = buildTrace(parseInput(SAMPLE))
  const ids = new Set(phases.map(p => p.id))
  const pyCount = python.split('\n').length
  assert.ok(frames.length > 0)
  for (const f of frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows) && Array.isArray(f.output))
  }
  assert.equal(frames.at(-1).phase, 'done')
  assert.deepEqual(frames.at(-1).output, EXPECTED)
})

test('1661 rejects an unknown activity type', () => {
  assert.throws(() => parseInput('{"activity":[{"machine_id":0,"process_id":0,"activity_type":"pause","timestamp":1},{"machine_id":0,"process_id":0,"activity_type":"end","timestamp":2}]}'))
})
