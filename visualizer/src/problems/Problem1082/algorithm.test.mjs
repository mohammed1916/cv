import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

const ids = phases.map(phase => phase.id)
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  assert.equal(trace.frames.at(-1).phase, 'done')
  for (const frame of trace.frames) {
    assert.ok(ids.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(Array.isArray(frame.rows) && Array.isArray(frame.columns))
    assert.equal(typeof frame.message, 'string')
  }
}

test('1082 sample keeps both sellers tied at four hundred', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ seller_id: 1 }, { seller_id: 2 }])
})

test('1082 a single seller is the unique top', () => {
  const trace = run('{"Sales":[{"seller_id":4,"price":10},{"seller_id":5,"price":3},{"seller_id":5,"price":3}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ seller_id: 4 }])
})

test('1082 rejects a sale without a price', () => {
  assert.throws(() => parseInput('{"Sales":[{"seller_id":4}]}'))
})
