import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const SAMPLE = '{"SchoolA":[{"student_id":1,"student_name":"Ava"},{"student_id":2,"student_name":"Ben"}],"SchoolB":[{"student_id":3,"student_name":"Ava"},{"student_id":4,"student_name":"Cy"}],"SchoolC":[{"student_id":5,"student_name":"Dee"},{"student_id":1,"student_name":"Ed"}]}'
const EXPECTED = [
  { member_A: 1, member_B: 4, member_C: 5 },
  { member_A: 2, member_B: 3, member_C: 1 },
  { member_A: 2, member_B: 3, member_C: 5 },
  { member_A: 2, member_B: 4, member_C: 1 },
  { member_A: 2, member_B: 4, member_C: 5 },
]

test('1623 keeps triplets with distinct ids and distinct names', () => {
  assert.deepEqual(buildTrace(parseInput(SAMPLE)).result, EXPECTED)
})

test('1623 frame invariants hold', () => {
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

test('1623 rejects a missing school list', () => {
  assert.throws(() => parseInput('{"SchoolA":[{"student_id":1,"student_name":"A"}],"SchoolB":[]}'))
})
