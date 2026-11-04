import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const row = (id, first, last, age) => ({ id, first, last, age })

test('2885 renames every header and keeps the values', () => {
  const { result, columns } = buildTrace({ students: [row(5, 'Ana', 'Berg', 12), row(9, 'Ben', 'Cole', 13)] })
  assert.deepEqual(columns, ['id', 'first', 'last', 'age'])
  assert.deepEqual(result, [
    { student_id: 5, first_name: 'Ana', last_name: 'Berg', age_in_years: 12 },
    { student_id: 9, first_name: 'Ben', last_name: 'Cole', age_in_years: 13 },
  ])
})

test('2885 shuffled columns keep each value with its own label', () => {
  const students = [{ age: 20, last: 'Ito', id: 3, first: 'Mei' }]
  const { result } = buildTrace({ students })
  assert.deepEqual(Object.keys(result[0]), ['age_in_years', 'last_name', 'student_id', 'first_name'])
  assert.deepEqual(result[0], { student_id: 3, first_name: 'Mei', last_name: 'Ito', age_in_years: 20 })
})

test('2885 an empty table still renames its headers', () => {
  const run = buildTrace({ students: [] })
  assert.deepEqual(run.result, [])
  assert.deepEqual(Object.values(run.frames.at(-1).renamed), ['student_id', 'first_name', 'last_name', 'age_in_years'])
})

test('2885 the input is not mutated and rows match an independent relabelling', () => {
  const students = Array.from({ length: 12 }, (_, i) => row(i, `f${i}`, `l${i}`, i * 2))
  const before = JSON.stringify(students)
  const { result } = buildTrace({ students })
  assert.equal(JSON.stringify(students), before)
  result.forEach((r, i) => {
    assert.equal(r.student_id, students[i].id)
    assert.equal(r.first_name, students[i].first)
    assert.equal(r.last_name, students[i].last)
    assert.equal(r.age_in_years, students[i].age)
  })
})

test('2885 parse rejects malformed tables', () => {
  assert.doesNotThrow(() => parseInput('{"students":[]}'))
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"students":[{"id":1,"first":"a","last":"b"}]}'))
  assert.throws(() => parseInput('{"students":[{"id":1,"first":"a","last":"b","age":"x"}]}'))
  assert.throws(() => parseInput('{"students":[{"id":1,"first":"a","last":"b","age":2,"grade":3}]}'))
})

test('2885 frames are well formed', () => {
  const lines = python.split('\n')
  const ids = new Set(phases.map(p => p.id))
  const { frames } = buildTrace({ students: [row(1, 'x', 'y', 2)] })
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(code.some(c => c.line === frame.activeLine))
    assert.ok(lines[frame.pythonLine - 1].trim())
    assert.ok(frame.message.length > 0)
  }
  assert.equal(frames.filter(f => f.phase === 'rename').length, 4)
  assert.equal(frames.at(-1).phase, 'done')
})
