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

test('1148 returns authors who viewed one of their own articles, sorted', () => {
  assert.deepEqual(run(sample).result, [{ id: 1 }, { id: 3 }, { id: 7 }])
  assertFrames(run(sample))
})

test('1148 no self views gives no rows', () => {
  assert.deepEqual(buildTrace(parseInput('{"views":[{"article_id":1,"author_id":1,"viewer_id":2,"view_date":"2019-08-01"}]}')).result, [])
})
