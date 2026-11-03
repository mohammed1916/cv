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

test('1050 sample keeps only pairs with three or more records', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ actor_id: 1, director_id: 1 }, { actor_id: 2, director_id: 1 }])
})

test('1050 a pair with exactly two records is dropped', () => {
  const trace = run('{"ActorDirector":[{"actor_id":5,"director_id":6,"timestamp":1},{"actor_id":5,"director_id":6,"timestamp":2}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('1050 rejects rows without a timestamp', () => {
  assert.throws(() => parseInput('{"ActorDirector":[{"actor_id":1,"director_id":1}]}'))
})
