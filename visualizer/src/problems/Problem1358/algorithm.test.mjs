import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Reference: test every substring directly.
function brute(s) {
  let total = 0
  for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) {
    const part = s.slice(i, j + 1)
    if (part.includes('a') && part.includes('b') && part.includes('c')) total += 1
  }
  return total
}

test('sample strings give the counts from direct checking', () => {
  assert.equal(buildTrace(parseInput('{"s":"abcabc"}')).result, brute('abcabc'))
  assert.equal(buildTrace(parseInput('{"s":"aaacb"}')).result, 3)
  assert.equal(buildTrace(parseInput('{"s":"cba"}')).result, 1)
  assert.equal(buildTrace(parseInput('{"s":"abab"}')).result, 0)
})

test('random strings agree with direct substring checking', () => {
  let state = 3
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let k = 0; k < 300; k++) {
    const s = Array.from({ length: 1 + rand(20) }, () => 'abc'[rand(3)]).join('')
    assert.equal(buildTrace({ s }).result, brute(s), s)
  }
})

test('parse rejects other letters and strings longer than 30', () => {
  assert.throws(() => parseInput('{"s":"abd"}'), /only the letters/)
  assert.throws(() => parseInput(`{"s":"${'a'.repeat(31)}"}`), /1 to 30/)
})

test('every frame names a real phase, a code line and a Python line', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  const run = buildTrace({ s: 'aaacb' })
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
