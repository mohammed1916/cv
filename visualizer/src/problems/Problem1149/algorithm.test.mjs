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

test('1149 finds viewers with two distinct articles on one date', () => {
  assert.deepEqual(run(sample).result, [{ id: 11 }, { id: 14 }])
  assertFrames(run(sample))
})

test('1149 two views of one article on one day count once', () => {
  assert.deepEqual(run('{"views":[{"article_id":1,"author_id":2,"viewer_id":4,"view_date":"2019-08-01"},{"article_id":1,"author_id":2,"viewer_id":4,"view_date":"2019-08-01"}]}').result, [])
})
