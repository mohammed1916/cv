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
    { unique_id: null, name: 'Rosa' },
    { unique_id: null, name: 'Tariq' },
    { unique_id: 6, name: 'Ines' },
    { unique_id: 7, name: 'Oskar' },
    { unique_id: 4, name: 'Pauline' },
  ])
  checkFrames(run)
})

test('1378 rejects a non-integer mapping', () => {
  assert.throws(() => parseInput('{"Employees":[],"EmployeeUNI":[{"id":1,"unique_id":"x"}]}'))
})
