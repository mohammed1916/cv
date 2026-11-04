import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const row = (student_id, name, age) => ({ student_id, name, age })

test('2883 hand-computed filter keeps order and rows', () => {
  const a = row(501, 'Noor', 11), b = row(502, null, 13), c = row(507, 'Tomas', 12)
  assert.deepEqual(buildTrace({ students: [a, b, c] }).result, [a, c])
})

test('2883 edge cases', () => {
  assert.deepEqual(buildTrace({ students: [] }).result, [])
  assert.deepEqual(buildTrace({ students: [row(1, null, 5), row(2, null, 6)] }).result, [])
  const empty = row(3, '', 7)
  assert.deepEqual(buildTrace({ students: [empty] }).result, [empty])
})

test('2883 random tables match an independent splice oracle', () => {
  let seed = 2883
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const students = Array.from({ length: rnd(15) }, (_, i) => row(i, ['A', '', null, 'B'][rnd(4)], 5 + rnd(15)))
    const oracle = [...students]
    for (let i = oracle.length - 1; i >= 0; i--) if (oracle[i].name === null) oracle.splice(i, 1)
    assert.deepEqual(buildTrace({ students }).result, oracle)
  }
})

test('2883 parseInput validates rows', () => {
  assert.doesNotThrow(() => parseInput('{"students":[{"student_id":1,"name":null,"age":3}]}'))
  assert.throws(() => parseInput('{"students":[{"student_id":"x","name":null,"age":3}]}'))
  assert.throws(() => parseInput('{"students":[{"student_id":1,"name":4,"age":3}]}'))
  assert.throws(() => parseInput('[]'))
})

test('2883 frames: mask fills in row order, then rows are kept, lines are real', () => {
  const { frames } = buildTrace({ students: [row(1, 'A', 5), row(2, null, 6), row(3, 'B', 7)] })
  assert.deepEqual(frames.filter(f => f.phase === 'mask').map(f => f.at), [0, 1, 2])
  assert.deepEqual(frames.at(-1).mask, [true, false, true])
  assert.deepEqual(frames.at(-1).kept, [0, 2])
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  for (const f of frames) {
    assert.ok(ids.has(f.phase) && f.message)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(pyLines[f.pythonLine - 1]?.trim())
  }
})
