import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, sampleText } from './algorithm.js'

const PHASES = ['load', 'filter', 'group', 'order', 'done']

function checkFrames(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASES.includes(frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.ok(frame.message.length > 0)
    assert.ok(Array.isArray(frame.table.columns) && Array.isArray(frame.table.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).table.rows, run.frames.at(-1).table.rows.map(row => ({ ...row })))
}

test('1211 sample gives the hand-computed rows', () => {
  const run = buildTrace(parseInput(sampleText))
  assert.deepEqual(run.result, [
    { query_name: 'Bird', quality: 1.5, poor_query_percentage: 0 },
    { query_name: 'Cat', quality: 1, poor_query_percentage: 50 },
    { query_name: 'Dog', quality: 2.17, poor_query_percentage: 33.33 },
  ])
  checkFrames(run)
})

test('1211 a rating of exactly 3 is not poor and repeated observations all count', () => {
  const run = buildTrace(parseInput(JSON.stringify({
    queries: [
      { query_name: 'A', result: 'x', position: 1, rating: 3 },
      { query_name: 'A', result: 'y', position: 1, rating: 3 },
      { query_name: 'A', result: 'z', position: 1, rating: 2 },
    ],
  })))
  assert.deepEqual(run.result, [{ query_name: 'A', quality: 2.67, poor_query_percentage: 33.33 }])
  checkFrames(run)
})

test('1211 rejects a non-integer rating', () => {
  assert.throws(() => parseInput(JSON.stringify({ queries: [{ query_name: 'A', result: 'x', position: 1, rating: 2.5 }] })))
})
