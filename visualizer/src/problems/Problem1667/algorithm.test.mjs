import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const run = text => buildTrace(parseInput(text))

test('sample rows are rewritten and ordered by user_id', () => {
  const rows = '[{"user_id":9,"name":"mARIA"},{"user_id":2,"name":"tom"},{"user_id":5,"name":"JOHN"}]'
  assert.deepEqual(run(rows).result, [
    { user_id: 2, name: 'Tom' },
    { user_id: 5, name: 'John' },
    { user_id: 9, name: 'Maria' },
  ])
})

test('single-letter names are uppercased without a remainder', () => {
  assert.deepEqual(run('[{"user_id":1,"name":"a"}]').result, [{ user_id: 1, name: 'A' }])
})

test('random tables agree with an independent sort and casing oracle', () => {
  let seed = 11
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let t = 0; t < 200; t++) {
    const size = 1 + rnd(12)
    const ids = [...new Set(Array.from({ length: size * 3 }, () => 1 + rnd(99)))].slice(0, size)
    const rows = ids.map(user_id => ({ user_id, name: Array.from({ length: 1 + rnd(8) }, () => letters[rnd(52)]).join('') }))
    const expected = rows
      .map(r => ({ user_id: r.user_id, name: r.name[0].toUpperCase() + r.name.slice(1).toLowerCase() }))
      .sort((a, b) => a.user_id - b.user_id)
    assert.deepEqual(run(JSON.stringify(rows)).result, expected)
  }
})

test('malformed tables are rejected with a specific message', () => {
  assert.throws(() => parseInput('[{"user_id":1,"name":"a"},{"user_id":1,"name":"b"}]'), /appears twice/)
  assert.throws(() => parseInput('[{"user_id":0,"name":"a"}]'), /user_id/)
  assert.throws(() => parseInput('[{"user_id":1,"name":"ann1"}]'), /letters/)
  assert.throws(() => parseInput('[]'), /1 to 30/)
})

test('every frame names a real phase and lines inside the code and Python listings', () => {
  const ids = new Set(phases.map(p => p.id))
  const codeLines = code.length, pyLines = python.split('\n').length
  for (const frame of run('[{"user_id":3,"name":"zed"},{"user_id":1,"name":"amy"}]').frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 10)
  }
})
