import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, sample } from './algorithm.js'

function checkFrames(run) {
  const lineCount = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(phases.some(phase => phase.id === frame.phase), `unknown phase ${frame.phase}`)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= lineCount)
    assert.ok(frame.message.length > 0)
    assert.ok(Array.isArray(frame.view.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}


test('1378 keeps every employee and leaves unmapped identifiers empty', () => {
  const run = buildTrace(parseInput(JSON.stringify(sample)))
  assert.deepEqual(run.result, [
    { unique_id: null, name: 'Alice' },
    { unique_id: null, name: 'Bob' },
    { unique_id: 2, name: 'Meir' },
    { unique_id: 3, name: 'Winston' },
    { unique_id: 1, name: 'Jonathan' },
  ])
  checkFrames(run)
})

test('1378 rejects a non-integer mapping', () => {
  assert.throws(() => parseInput('{"Employees":[],"EmployeeUNI":[{"id":1,"unique_id":"x"}]}'))
})
