import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

// Independent oracle using a regular expression rather than the loop under test.
const oracle = s => s.replace(/[aeiou]/g, '')

test('own samples keep consonants in order', () => {
  assert.equal(buildTrace({ s: 'sketching' }).result, 'sktchng')
  assert.equal(buildTrace({ s: 'aeiou' }).result, '')
  assert.equal(buildTrace({ s: 'rhythm' }).result, 'rhythm')
  assert.equal(buildTrace({ s: 'z' }).result, 'z')
})

test('random lowercase strings agree with the regular-expression oracle', () => {
  let state = 17
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'
  for (let t = 0; t < 500; t++) {
    const len = 1 + rand(60)
    let s = ''
    for (let i = 0; i < len; i++) s += alphabet[rand(26)]
    assert.equal(buildTrace({ s }).result, oracle(s), s)
  }
})

test('every frame names a declared phase and a real code line', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace({ s: 'algorithm' })
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(f.message.length > 5)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
  }
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('{"s":"Hello"}'), /lowercase/)
  assert.throws(() => parseInput('{"s":""}'), /1 to 60/)
  assert.throws(() => parseInput('{"t":"abc"}'), /string s/)
})
