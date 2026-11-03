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

const sample = '{"friendship":[{"user1_id":1,"user2_id":2},{"user1_id":3,"user2_id":1},{"user1_id":2,"user2_id":4},{"user1_id":5,"user2_id":6}],"likes":[{"user_id":1,"page_id":10},{"user_id":2,"page_id":20},{"user_id":3,"page_id":20},{"user_id":3,"page_id":30},{"user_id":4,"page_id":40},{"user_id":4,"page_id":10},{"user_id":5,"page_id":50}]}'

test('1264 sample recommendations match the hand computation', () => {
  const result = run(sample)
  // Friends of 1 are 2 and 3. Their pages are 20, 20 and 30; user 1 already likes 10.
  assert.deepEqual(result.result, [{ recommended_page: 20 }, { recommended_page: 30 }])
  checkFrames(result)
})

test('1264 friendship is read from either column', () => {
  const result = run('{"friendship":[{"user1_id":9,"user2_id":1}],"likes":[{"user_id":9,"page_id":5}]}')
  assert.deepEqual(result.result, [{ recommended_page: 5 }])
})

test('1264 friends of friends are not recommended', () => {
  const result = run('{"friendship":[{"user1_id":1,"user2_id":2},{"user1_id":2,"user2_id":3}],"likes":[{"user_id":3,"page_id":99}]}')
  assert.deepEqual(result.result, [])
  checkFrames(result)
})

test('1264 rejects a friendship with one user', () => {
  assert.throws(() => parseInput('{"friendship":[{"user1_id":1,"user2_id":1}],"likes":[{"user_id":1,"page_id":2}]}'))
})
