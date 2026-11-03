import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"users":[{"user_id":1,"user_name":"Ana"},{"user_id":2,"user_name":"Ben"},{"user_id":3,"user_name":"Cy"},{"user_id":4,"user_name":"Dee"}],"register":[{"contest_id":215,"user_id":1},{"contest_id":215,"user_id":2},{"contest_id":215,"user_id":3},{"contest_id":209,"user_id":2},{"contest_id":209,"user_id":3},{"contest_id":211,"user_id":1},{"contest_id":211,"user_id":4},{"contest_id":208,"user_id":1},{"contest_id":208,"user_id":2},{"contest_id":208,"user_id":3},{"contest_id":208,"user_id":4}]}'
const EXPECTED = [
  { contest_id: 208, percentage: 100 },
  { contest_id: 215, percentage: 75 },
  { contest_id: 209, percentage: 50 },
  { contest_id: 211, percentage: 50 },
]

test('1633 percentages of all users, sorted by percentage then contest', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1633 frame invariants hold', () => {
  const { frames } = buildTrace(parseInput(SAMPLE))
  const ids = new Set(phases.map(p => p.id))
  const pyCount = python.split('\n').length
  assert.ok(frames.length > 0)
  for (const f of frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyCount)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows) && Array.isArray(f.output))
  }
  assert.equal(frames.at(-1).phase, 'done')
  assert.deepEqual(frames.at(-1).output, EXPECTED)
})

test('1633 rounds to two decimals', () => {
  const { result } = buildTrace(parseInput('{"users":[{"user_id":1,"user_name":"A"},{"user_id":2,"user_name":"B"},{"user_id":3,"user_name":"C"}],"register":[{"contest_id":1,"user_id":1}]}'))
  assert.deepEqual(result, [{ contest_id: 1, percentage: 33.33 }])
})
