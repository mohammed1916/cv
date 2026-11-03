import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const sample = {
  departments: [{ id: 1, name: 'Physics' }, { id: 2, name: 'Biology' }, { id: 3, name: 'History' }],
  students: [
    { id: 10, name: 'Ivy', department_id: 1 },
    { id: 11, name: 'Jun', department_id: null },
    { id: 12, name: 'Kai', department_id: 4 },
    { id: 13, name: 'Lea', department_id: 2 },
    { id: 14, name: 'Max', department_id: 9 },
  ],
}

function checkFrames(trace) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  assert.ok(trace.frames.length > 0)
  for (const f of trace.frames) {
    assert.ok(ids.has(f.phase), `unknown phase ${f.phase}`)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
  assert.equal(trace.frames.at(-1).phase, 'output')
}

test('1350 sample flags ids 4 and 9 and skips the NULL department', () => {
  const trace = buildTrace(parseInput(JSON.stringify(sample)))
  assert.deepEqual(trace.result, [{ id: 12, name: 'Kai' }, { id: 14, name: 'Max' }])
  assert.ok(trace.frames.some(f => f.phase === 'skip'))
  checkFrames(trace)
})

test('1350 no invalid departments gives an empty result', () => {
  const trace = buildTrace(parseInput('{"departments":[{"id":1,"name":"Math"}],"students":[{"id":5,"name":"Ora","department_id":1}]}'))
  assert.deepEqual(trace.result, [])
  checkFrames(trace)
})

test('1350 rejects a department_id that is neither an integer nor null', () => {
  assert.throws(() => parseInput('{"departments":[],"students":[{"id":1,"name":"A","department_id":"2"}]}'))
})
