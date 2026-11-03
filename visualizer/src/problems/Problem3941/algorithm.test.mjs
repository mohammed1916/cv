import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = password => buildTrace({ password }).result

function assertFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase), f.phase)
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `pseudocode ${f.activeLine}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `python ${f.pythonLine}`)
    assert.ok(f.message.length > 0)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).score, run.result)
}

test('3941 hand-checked cases', () => {
  assert.equal(solve('aAbB11!!'), 14)
  assert.equal(solve('Zz9@9@'), 11)
  assert.equal(solve('a'), 1)
  assert.equal(solve('!'), 5)
  assert.equal(solve('aaaa'), 1)
})

test('3941 frames are complete for the presets', () => {
  assertFrames(buildTrace({ password: 'aAbB11!!' }))
  assertFrames(buildTrace({ password: 'Zz9@9@' }))
})

test('3941 rejects other characters', () => {
  assert.throws(() => parseInput(''))
  assert.throws(() => parseInput('abc%'))
  assert.throws(() => parseInput('a'.repeat(61)))
})

test('3941 random passwords match a set-based score', () => {
  let seed = 3941
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'abcXYZ0129!@#$'
  const weight = ch => (/[a-z]/.test(ch) ? 1 : /[A-Z]/.test(ch) ? 2 : /[0-9]/.test(ch) ? 3 : 5)
  for (let t = 0; t < 300; t++) {
    const password = Array.from({ length: 1 + rnd(20) }, () => alphabet[rnd(alphabet.length)]).join('')
    const expected = [...new Set(password)].reduce((sum, ch) => sum + weight(ch), 0)
    assert.equal(solve(password), expected, password)
  }
})
