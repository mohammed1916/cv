import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const PHASE_IDS = new Set(phases.map(phase => phase.id))
const SAMPLE = '{"Tree":[{"N":1,"P":2},{"N":2,"P":5},{"N":3,"P":2},{"N":4,"P":1},{"N":5,"P":null}]}'

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

test('3054 labels the sample tree Root, Inner and Leaf', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(trace.result, [
    { N: 1, type: 'Inner' },
    { N: 2, type: 'Inner' },
    { N: 3, type: 'Leaf' },
    { N: 4, type: 'Leaf' },
    { N: 5, type: 'Root' },
  ])
  assertFrames(trace)
})

test('3054 a single node with no parent is the Root', () => {
  const trace = buildTrace(parseInput('{"Tree":[{"N":1,"P":null}]}'))
  assert.deepEqual(trace.result, [{ N: 1, type: 'Root' }])
  assertFrames(trace)
})

test('3054 rejects duplicate node ids', () => {
  assert.throws(() => parseInput('{"Tree":[{"N":1,"P":null},{"N":1,"P":1}]}'), /unique/)
})
