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


test('1327 totals February units and keeps products at 100 or more', () => {
  const run = buildTrace(parseInput(JSON.stringify(sample)))
  assert.deepEqual(run.result, [
    { product_name: 'Kitchen', unit: 105 },
    { product_name: 'Lamp', unit: 153 },
    { product_name: 'Pens', unit: 100 },
  ])
  checkFrames(run)
})

test('1327 rejects a malformed order date', () => {
  assert.throws(() => parseInput('{"Products":[],"Orders":[{"product_id":1,"order_date":"2020/02/01","unit":5}]}'))
})
