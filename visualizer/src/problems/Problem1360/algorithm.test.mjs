import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Reference: the built-in date library, measured in whole days.
const reference = (a, b) => Math.abs(Date.UTC(...b.split('-').map((p, i) => i === 1 ? Number(p) - 1 : Number(p))) - Date.UTC(...a.split('-').map((p, i) => i === 1 ? Number(p) - 1 : Number(p)))) / 86400000

test('sample pairs give the expected gaps, including a leap February', () => {
  const run = (first, second) => buildTrace(parseInput(JSON.stringify({ first, second }))).result
  assert.equal(run('2019-06-29', '2019-06-30'), 1)
  assert.equal(run('2020-01-15', '2019-12-31'), 15)
  assert.equal(run('2024-02-28', '2024-03-01'), 2)
  assert.equal(run('2023-02-28', '2023-03-01'), 1)
})

test('random dates agree with the built-in date arithmetic in both orders', () => {
  let state = 41
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const pick = () => {
    const y = 1900 + rand(201), m = 1 + rand(12)
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate()
    const d = 1 + rand(days)
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }
  for (let k = 0; k < 300; k++) {
    const first = pick(), second = pick()
    const input = JSON.stringify({ first, second })
    assert.equal(buildTrace(parseInput(input)).result, reference(first, second), input)
  }
})

test('parse rejects impossible dates and bad formats', () => {
  assert.throws(() => parseInput('{"first":"2021-02-29","second":"2021-03-01"}'), /real calendar date/)
  assert.throws(() => parseInput('{"first":"2021/02/01","second":"2021-03-01"}'), /YYYY-MM-DD/)
})

test('every frame names a real phase, a code line and a Python line', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  const run = buildTrace(parseInput('{"first":"2020-01-15","second":"2019-12-31"}'))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
