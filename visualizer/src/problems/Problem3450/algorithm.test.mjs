import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

function assertFrames(trace) {
  assert.ok(trace.frames.length >= 2)
  for (const frame of trace.frames) {
    assert.ok(phases.some(phase => phase.id === frame.phase), frame.phase)
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine > 0)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine > 0)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.rows))
  }
  assert.deepEqual(trace.frames.at(-1).rows, trace.result)
}

const SAMPLE = '{"students":[{"student_id":1,"bench_id":"A"},{"student_id":2,"bench_id":"A"},{"student_id":1,"bench_id":"A"},{"student_id":3,"bench_id":"B"},{"student_id":4,"bench_id":"B"},{"student_id":2,"bench_id":"B"},{"student_id":5,"bench_id":"C"}]}'

test('3450 sample: bench B has three distinct students', () => {
  const trace = buildTrace(parseInput(SAMPLE))
  assert.deepEqual(trace.result, [{ max_students: 3 }])
  assertFrames(trace)
  const dedupeFrames = trace.frames.filter(frame => frame.phase === 'dedupe')
  assert.equal(dedupeFrames.length, 7)
  assert.equal(dedupeFrames[2].rows.length, 2)
})

test('3450 empty table and rejected rows', () => {
  assert.deepEqual(solve('{"students":[]}'), [{ max_students: 0 }])
  assert.throws(() => parseInput('{"students":[{"student_id":"1","bench_id":"A"}]}'))
})

test('3450 random tables match a set-based oracle', () => {
  let seed = 3450
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const students = Array.from({ length: rnd(10) }, () => ({ student_id: 1 + rnd(5), bench_id: 'XYZ'[rnd(3)] }))
    const sets = new Map()
    for (const { student_id, bench_id } of students) {
      if (!sets.has(bench_id)) sets.set(bench_id, new Set())
      sets.get(bench_id).add(student_id)
    }
    const expected = Math.max(0, ...[...sets.values()].map(set => set.size))
    assert.deepEqual(solve(JSON.stringify({ students })), [{ max_students: expected }], JSON.stringify(students))
  }
})
