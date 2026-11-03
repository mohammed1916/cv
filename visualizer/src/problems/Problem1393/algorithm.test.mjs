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


test('1393 nets sells against buys for each stock', () => {
  const run = buildTrace(parseInput(JSON.stringify(sample)))
  assert.deepEqual(run.result, [
    { stock_name: 'Corona Masks', capital_gain_loss: 500 },
    { stock_name: 'Handbags', capital_gain_loss: -23000 },
    { stock_name: 'Leetcode', capital_gain_loss: 5000 },
  ])
  checkFrames(run)
})

test('1393 rejects an unknown operation', () => {
  assert.throws(() => parseInput('{"Stocks":[{"stock_name":"X","operation":"Hold","operation_day":1,"price":5}]}'))
})
