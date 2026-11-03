import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Reference: letters of t that s can keep are matched; every unmatched letter of t needs one change.
function reference(s, t) {
  const left = new Map()
  for (const ch of s) left.set(ch, (left.get(ch) || 0) + 1)
  let matched = 0
  for (const ch of t) {
    if ((left.get(ch) || 0) > 0) { left.set(ch, left.get(ch) - 1); matched += 1 }
  }
  return t.length - matched
}

test('sample words need one change, equal words need none, disjoint words need six', () => {
  assert.equal(buildTrace(parseInput('{"s":"bab","t":"aba"}')).result, 1)
  assert.equal(buildTrace(parseInput('{"s":"abcd","t":"dcba"}')).result, 0)
  assert.equal(buildTrace(parseInput('{"s":"aabbcc","t":"xxyyzz"}')).result, 6)
})

test('random words agree with the reference after the full trace', () => {
  let state = 17
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const alphabet = 'abcxyz'
  const word = n => Array.from({ length: n }, () => alphabet[rand(alphabet.length)]).join('')
  for (let k = 0; k < 300; k++) {
    const n = 1 + rand(12)
    const s = word(n), t = word(n)
    assert.equal(buildTrace({ s, t }).result, reference(s, t), `${s} ${t}`)
  }
})

test('parse rejects unequal lengths, empty input and non-letters', () => {
  assert.throws(() => parseInput('{"s":"ab","t":"abc"}'), /same length/)
  assert.throws(() => parseInput('{"s":"","t":""}'), /1 to 20/)
  assert.throws(() => parseInput('{"s":"A","t":"a"}'), /lowercase/)
})

test('every frame names a real phase, a code line and a Python line', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  const run = buildTrace({ s: 'bab', t: 'aba' })
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
