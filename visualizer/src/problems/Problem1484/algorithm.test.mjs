import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const sample = JSON.stringify({
  activities: [
    { sell_date: '2020-05-30', product: 'Headphone' },
    { sell_date: '2020-05-30', product: 'Basketball' },
    { sell_date: '2020-05-30', product: 'Headphone' },
    { sell_date: '2020-06-01', product: 'Pencil' },
    { sell_date: '2020-06-01', product: 'Bible' },
    { sell_date: '2020-06-02', product: 'Mask' },
    { sell_date: '2020-06-02', product: 'Mask' },
  ],
})

const PHASES = ['load', 'dedupe', 'group', 'output', 'done']

function checkFrames(trace) {
  const pyCount = python.split('\n').length
  for (const frame of trace.frames) {
    assert.ok(PHASES.includes(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.rows))
  }
}

test('1484 groups distinct products per date in order', () => {
  const trace = buildTrace(parseInput(sample))
  assert.deepEqual(trace.result, [
    { sell_date: '2020-05-30', num_sold: 2, products: 'Basketball,Headphone' },
    { sell_date: '2020-06-01', num_sold: 2, products: 'Bible,Pencil' },
    { sell_date: '2020-06-02', num_sold: 1, products: 'Mask' },
  ])
  checkFrames(trace)
})

test('1484 a date with one repeated product reports one', () => {
  const trace = buildTrace(parseInput('{"activities":[{"sell_date":"2021-01-05","product":"Pen"},{"sell_date":"2021-01-05","product":"Pen"}]}'))
  assert.deepEqual(trace.result, [{ sell_date: '2021-01-05', num_sold: 1, products: 'Pen' }])
  checkFrames(trace)
})

test('1484 rejects a malformed date', () => {
  assert.throws(() => parseInput('{"activities":[{"sell_date":"05-30-2020","product":"Pen"}]}'))
})
