import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const run = text => buildTrace(parseInput(text))
const pythonLineCount = python.split('\n').length

function checkFrames(result) {
  const phaseIds = new Set(phases.map(phase => phase.id))
  assert.ok(result.frames.length > 0)
  for (const frame of result.frames) {
    assert.ok(phaseIds.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pythonLineCount)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.columns) && Array.isArray(frame.rows))
  }
  assert.deepEqual(result.frames.at(-1).rows, result.result)
}

const sample = '{"submissions":[{"sub_id":1,"parent_id":null},{"sub_id":2,"parent_id":null},{"sub_id":3,"parent_id":1},{"sub_id":4,"parent_id":1},{"sub_id":3,"parent_id":1},{"sub_id":5,"parent_id":2},{"sub_id":6,"parent_id":null}]}'

test('1241 sample counts match the hand computation', () => {
  const result = run(sample)
  assert.deepEqual(result.result, [
    { post_id: 1, number_of_comments: 2 },
    { post_id: 2, number_of_comments: 1 },
    { post_id: 6, number_of_comments: 0 },
  ])
  checkFrames(result)
})

test('1241 a duplicated reply is counted only once', () => {
  const result = run('{"submissions":[{"sub_id":1,"parent_id":null},{"sub_id":7,"parent_id":1},{"sub_id":7,"parent_id":1},{"sub_id":7,"parent_id":1}]}')
  assert.deepEqual(result.result, [{ post_id: 1, number_of_comments: 1 }])
  checkFrames(result)
})

test('1241 total comments equal the distinct replies that point at posts', () => {
  const result = run(sample)
  assert.equal(result.result.reduce((sum, row) => sum + row.number_of_comments, 0), 3)
})

test('1241 rejects a comment that points at another comment', () => {
  assert.throws(() => parseInput('{"submissions":[{"sub_id":1,"parent_id":null},{"sub_id":2,"parent_id":1},{"sub_id":3,"parent_id":2}]}'))
})
