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

test('1098 sample keeps available books under ten copies, including unsold ones', () => {
  const trace = run(examples[0].input)
  checkFrames(trace)
  assert.deepEqual(trace.result, [
    { book_id: 1, name: 'Atlas' },
    { book_id: 2, name: 'Blue Notes' },
    { book_id: 5, name: 'Clay Pot' },
  ])
})

test('1098 a book sold exactly ten copies in the window is dropped', () => {
  const trace = run('{"Books":[{"book_id":7,"name":"Edge","available_from":"2018-01-01"}],"Orders":[{"book_id":7,"quantity":10,"dispatch_date":"2019-01-01"}]}')
  checkFrames(trace)
  assert.deepEqual(trace.result, [])
})

test('1098 rejects an order without a dispatch date', () => {
  assert.throws(() => parseInput('{"Books":[{"book_id":1,"name":"A","available_from":"2018-01-01"}],"Orders":[{"book_id":1,"quantity":1}]}'))
})
