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

test('3053 sample labels every row in input order', () => {
  const trace = run('{"Triangles":[{"A":7,"B":7,"C":7},{"A":6,"B":8,"C":8},{"A":4,"B":9,"C":6},{"A":2,"B":3,"C":9},{"A":6,"B":6,"C":12}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result.map(row => row.triangle_type), [
    'Equilateral', 'Isosceles', 'Scalene', 'Not A Triangle', 'Not A Triangle',
  ])
})

test('3053 a degenerate triangle is invalid even with equal sides', () => {
  const trace = run('{"Triangles":[{"A":1,"B":1,"C":1},{"A":2,"B":2,"C":4}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ triangle_type: 'Equilateral' }, { triangle_type: 'Not A Triangle' }])
})

test('3053 rejects a row without side C', () => {
  assert.throws(() => parseInput('{"Triangles":[{"A":3,"B":4}]}'))
})
