import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

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

const sample = examples[0].input
const run = text => buildTrace(parseInput(text))

test('1179 pivots months into columns and leaves gaps as NULL', () => {
  const result = run(sample).result
  assert.equal(result.length, 3)
  assert.deepEqual(result[0], { id: 1, Jan_Revenue: 4100, Feb_Revenue: 3800, Mar_Revenue: 6200, Apr_Revenue: null, May_Revenue: null, Jun_Revenue: null, Jul_Revenue: null, Aug_Revenue: null, Sep_Revenue: null, Oct_Revenue: null, Nov_Revenue: null, Dec_Revenue: null })
  assert.equal(result[1].Dec_Revenue, 5100)
  assert.equal(result[1].Feb_Revenue, null)
  assert.equal(result[2].Feb_Revenue, 9300)
  assertFrames(run(sample))
})

test('1179 rejects two rows for one department and month', () => {
  assert.throws(() => parseInput('{"department":[{"id":1,"revenue":5,"month":"Jan"},{"id":1,"revenue":6,"month":"Jan"}]}'))
})
