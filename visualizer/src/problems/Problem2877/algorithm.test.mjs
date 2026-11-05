import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const PY = python.split('\n')

test('2877 keeps rows in order with the two named columns', () => {
  assert.deepEqual(buildTrace(parseInput('{"data":[[101,18],[102,22]]}')).result, [{ student_id: 101, age: 18 }, { student_id: 102, age: 22 }])
})

test('2877 frames point at real python lines', () => {
  for (const f of buildTrace({ data: [[1, 2]] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2877 rejects rows with the wrong width', () => {
  assert.throws(() => parseInput('{"data":[[1,2,3]]}'))
})
