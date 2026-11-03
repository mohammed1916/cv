import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

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

test('2118 sample writes the four terms in descending power', () => {
  const trace = run('{"Terms":[{"power":3,"factor":2},{"power":2,"factor":-1},{"power":1,"factor":1},{"power":0,"factor":-1}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ equation: '2X^3-X^2+X-1=0' }])
})

test('2118 drops zero terms and starts with a negative sign when needed', () => {
  const trace = run('{"Terms":[{"power":1,"factor":0},{"power":2,"factor":-1},{"power":0,"factor":5}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ equation: '-X^2+5=0' }])
})

test('2118 rejects repeated powers', () => {
  assert.throws(() => parseInput('{"Terms":[{"power":1,"factor":2},{"power":1,"factor":3}]}'))
})
