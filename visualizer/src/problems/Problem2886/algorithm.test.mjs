import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python, code, formatFloat, phases } from './algorithm.js'

const student = (student_id, name, age, grade) => ({ student_id, name, age, grade })

test('2886 hand-computed conversions', () => {
  const { result } = buildTrace({ students: [student(1, 'Noor', 12, 64), student(2, 'Theo', 14, 91.75), student(3, 'Ada', 9, 0.5)] })
  assert.deepEqual(result.map(r => r.grade), [64, 91, 0])
})

test('2886 other columns stay untouched', () => {
  const students = [student(5, 'Ines', 16, 79.9)]
  const { result } = buildTrace({ students })
  assert.deepEqual(result, [student(5, 'Ines', 16, 79)])
  assert.equal(students[0].grade, 79.9)
})

test('2886 negative fractions move toward zero and never print -0', () => {
  const { result } = buildTrace({ students: [student(1, 'a', 1, -3.7), student(2, 'b', 1, -0.5)] })
  assert.equal(result[0].grade, -3)
  assert.ok(Object.is(result[1].grade, 0))
})

test('2886 oracle: result is the printed text before the decimal point', () => {
  let seed = 2886
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const grade = rnd(100000) / (1 + rnd(1000))
    const { result } = buildTrace({ students: [student(t, 'x', 10, grade)] })
    assert.equal(result[0].grade, Number(formatFloat(grade).split('.')[0]), String(grade))
  }
})

test('2886 parser accepts tables and rejects bad rows', () => {
  assert.deepEqual(parseInput('{"students":[]}'), { students: [] })
  assert.equal(parseInput('{"students":[{"student_id":1,"name":"a","age":3,"grade":4.5}]}').students[0].grade, 4.5)
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"students":[{"student_id":1,"name":"a","age":3,"grade":"4"}]}'))
  assert.throws(() => parseInput('{"students":[{"student_id":1.5,"name":"a","age":3,"grade":4}]}'))
})

test('2886 frames are valid and progress through the table', () => {
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  for (const students of [[], [student(1, 'a', 1, 2.5), student(2, 'b', 1, 3)]]) {
    const { frames } = buildTrace({ students })
    for (const f of frames) {
      assert.ok(ids.has(f.phase))
      assert.ok(f.message.length > 0)
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(pyLines[f.pythonLine - 1]?.trim(), `python line ${f.pythonLine}`)
    }
    assert.equal(frames.filter(f => f.phase === 'convert').length, students.length)
    assert.equal(frames.at(-1).dtype, 'int64')
    assert.equal(frames[0].dtype, 'float64')
  }
  const { frames } = buildTrace({ students: [student(1, 'a', 1, 2.5)] })
  const convert = frames.find(f => f.phase === 'convert')
  assert.deepEqual(convert.conversion, { shown: '2.5', whole: 2, dropped: '5', lost: true })
  assert.equal(frames[0].after[0].grade, '?')
  assert.equal(frames.at(-1).after[0].grade, 2)
})
