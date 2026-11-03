import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples } from './algorithm.js'

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

test('2372 sample sums through customers and keeps Cy at 0', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { salesperson_id: 1, name: 'Ana', total: 170 },
    { salesperson_id: 2, name: 'Ben', total: 30 },
    { salesperson_id: 3, name: 'Cy', total: 0 },
  ])
})

test('2372 a salesperson with no customers has total 0', () => {
  const trace = run('{"Salesperson":[{"salesperson_id":4,"name":"Dee"}],"Customer":[{"customer_id":1,"salesperson_id":4}],"Sales":[{"sale_id":9,"customer_id":77,"price":5}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [{ salesperson_id: 4, name: 'Dee', total: 0 }])
})

test('2372 rejects a customer row without a salesperson', () => {
  assert.throws(() => parseInput('{"Salesperson":[{"salesperson_id":1,"name":"A"}],"Customer":[{"customer_id":1}],"Sales":[]}'))
})
