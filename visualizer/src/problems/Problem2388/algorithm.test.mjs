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

const SAMPLE = '{"CoffeeShop":[{"id":1,"drink":"latte"},{"id":2,"drink":null},{"id":3,"drink":"mocha"},{"id":4,"drink":null},{"id":5,"drink":null},{"id":6,"drink":"espresso"},{"id":7,"drink":null}]}'

test('2388 sample fills each NULL with the nearest earlier drink', () => {
  const trace = run(SAMPLE)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { id: 1, drink: 'latte' }, { id: 2, drink: 'latte' }, { id: 3, drink: 'mocha' },
    { id: 4, drink: 'mocha' }, { id: 5, drink: 'mocha' }, { id: 6, drink: 'espresso' }, { id: 7, drink: 'espresso' },
  ])
})

test('2388 walks rows in id order, not input order', () => {
  const trace = run('{"CoffeeShop":[{"id":3,"drink":"tea"},{"id":1,"drink":"coffee"},{"id":2,"drink":null}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ id: 1, drink: 'coffee' }, { id: 2, drink: 'coffee' }, { id: 3, drink: 'tea' }])
})

test('2388 rejects a table whose first row is NULL', () => {
  assert.throws(() => parseInput('{"CoffeeShop":[{"id":1,"drink":null},{"id":2,"drink":"tea"}]}'))
})
