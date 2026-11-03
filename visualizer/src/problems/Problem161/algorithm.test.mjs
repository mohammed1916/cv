import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent reference: t is reachable from s by exactly one insert, delete or replace.
function reference(s, t) {
  if (s === t) return false
  const alphabet = 'ab'
  const edits = new Set()
  for (let i = 0; i <= s.length; i++) for (const c of alphabet) edits.add(s.slice(0, i) + c + s.slice(i))
  for (let i = 0; i < s.length; i++) {
    edits.add(s.slice(0, i) + s.slice(i + 1))
    for (const c of alphabet) edits.add(s.slice(0, i) + c + s.slice(i + 1))
  }
  return edits.has(t)
}

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 10)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, `code line ${f.activeLine}`)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.split('\n').length, `python line ${f.pythonLine}`)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('sample insertion cart to cat is one edit', () => {
  const run = buildTrace(parseInput('{"s":"cart","t":"cat"}'))
  assert.equal(run.result, true)
  assertFrames(run)
})

test('equal strings, replacement, and appended character', () => {
  assert.equal(buildTrace({ s: 'same', t: 'same' }).result, false)
  assert.equal(buildTrace({ s: 'abc', t: 'axc' }).result, true)
  assert.equal(buildTrace({ s: 'river', t: 'rivers' }).result, true)
  assert.equal(buildTrace({ s: 'abc', t: 'axd' }).result, false)
})

test('empty strings and a length gap of two', () => {
  assert.equal(buildTrace({ s: '', t: 'a' }).result, true)
  assert.equal(buildTrace({ s: '', t: '' }).result, false)
  assert.equal(buildTrace({ s: 'a', t: 'abc' }).result, false)
})

test('random small strings agree with the reference', () => {
  let seed = 4
  const rand = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % m }
  const word = () => Array.from({ length: rand(5) }, () => 'ab'[rand(2)]).join('')
  for (let k = 0; k < 400; k++) {
    const s = word()
    const t = rand(2) ? word() : (() => { const chars = [...s]; if (chars.length && rand(2)) chars[rand(chars.length)] = 'ab'[rand(2)]; else chars.splice(rand(chars.length + 1), 0, 'ab'[rand(2)]); return chars.join('') })()
    const run = buildTrace({ s, t })
    assert.equal(run.result, reference(s, t), JSON.stringify({ s, t }))
    assertFrames(run)
  }
})

test('invalid input is rejected', () => {
  assert.throws(() => parseInput('{"s":"Ab","t":"a"}'), /lowercase/)
  assert.throws(() => parseInput('{"s":"a"}'), /strings/)
})
