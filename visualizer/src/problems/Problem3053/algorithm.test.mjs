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
  const trace = run('{"Triangles":[{"A":20,"B":20,"C":23},{"A":20,"B":20,"C":20},{"A":20,"B":21,"C":22},{"A":13,"B":14,"C":30},{"A":5,"B":5,"C":10},{"A":3,"B":4,"C":5}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result.map(row => row.triangle_type), [
    'Isosceles', 'Equilateral', 'Scalene', 'Not A Triangle', 'Not A Triangle', 'Scalene',
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
