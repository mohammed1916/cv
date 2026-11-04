import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, examples, code, python } from './algorithm.js'

const pyLines = python.split('\n')
const ids = new Set(phases.map(phase => phase.id))
const run = text => buildTrace(parseInput(text))

function checkFrames(trace) {
  for (const frame of trace.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(pyLines[frame.pythonLine - 1]?.trim(), `python line ${frame.pythonLine} is blank`)
    assert.ok(frame.message.length > 0)
    assert.equal(frame.mask.length, trace.input.students.length)
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
  assert.deepEqual(trace.frames.at(-1).result, trace.result)
}

test('2880 picks the one matching row, name and age only', () => {
  const trace = run(examples[0].input)
  assert.deepEqual(trace.result, [{ name: 'Tomas', age: 15 }])
  checkFrames(trace)
})

test('2880 returns an empty table when id 101 is absent', () => {
  const trace = run(examples[1].input)
  assert.deepEqual(trace.result, [])
  checkFrames(trace)
})

test('2880 handles an empty table and repeated ids in row order', () => {
  assert.deepEqual(run('{"students":[]}').result, [])
  const trace = run('{"students":[{"student_id":101,"name":"B","age":2},{"student_id":5,"name":"C","age":3},{"student_id":101,"name":"A","age":1}]}')
  assert.deepEqual(trace.result, [{ name: 'B', age: 2 }, { name: 'A', age: 1 }])
})

test('2880 mask is filled one row per frame', () => {
  const trace = run(examples[0].input)
  const masks = trace.frames.filter(frame => frame.phase === 'mask')
  assert.equal(masks.length, 4)
  masks.forEach((frame, index) => {
    assert.equal(frame.at, index)
    assert.equal(frame.mask.filter(value => value !== null).length, index + 1)
  })
  assert.deepEqual(trace.frames.at(-1).mask, [false, true, false, false])
})

test('2880 agrees with an independent oracle on random tables', () => {
  let seed = 2880
  const next = limit => (seed = (seed * 1103515245 + 12345) % 2147483648) % limit
  for (let round = 0; round < 300; round++) {
    const students = Array.from({ length: next(13) }, (_, index) => ({ student_id: 99 + next(5), name: `s${index}`, age: next(30) }))
    const expected = []
    for (const { student_id, name, age } of students) if (!(student_id < 101 || student_id > 101)) expected.push({ name, age })
    const trace = buildTrace(parseInput(JSON.stringify({ students })))
    assert.deepEqual(trace.result, expected)
    checkFrames(trace)
  }
})

test('2880 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"students":[{"student_id":"101","name":"A","age":1}]}'))
  assert.throws(() => parseInput('{"students":[{"student_id":1,"age":1}]}'))
  assert.throws(() => parseInput(JSON.stringify({ students: Array.from({ length: 13 }, (_, i) => ({ student_id: i, name: 'x', age: 1 })) })))
})
