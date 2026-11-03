import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, sample } from './algorithm.js'

const run = buildTrace(parseInput(JSON.stringify(sample)))

test('1280 counts every student and subject pair', () => {
  const pick = (id, subject) => run.result.find(r => r.student_id === id && r.subject_name === subject).attended_exams
  assert.equal(run.result.length, 9)
  assert.equal(pick(1, 'Math'), 1)
  assert.equal(pick(1, 'Physics'), 2)
  assert.equal(pick(1, 'Programming'), 1)
  assert.equal(pick(2, 'Math'), 0)
  assert.equal(pick(2, 'Programming'), 2)
  assert.equal(pick(13, 'Math'), 0)
  assert.equal(pick(13, 'Physics'), 1)
})

test('1280 result is sorted by student then subject', () => {
  const keys = run.result.map(r => `${r.student_id}|${r.subject_name}`)
  assert.deepEqual(keys, [...keys].sort((a, b) => {
    const [sa, ja] = a.split('|'); const [sb, jb] = b.split('|')
    return Number(sa) - Number(sb) || (ja < jb ? -1 : ja > jb ? 1 : 0)
  }))
})

test('1280 frame invariants hold', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1)
    assert.equal(typeof f.message, 'string')
    assert.ok(Array.isArray(f.rows))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).rows, run.result)
})
