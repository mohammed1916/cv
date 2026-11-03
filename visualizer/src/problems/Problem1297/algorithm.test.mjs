import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Independent reference: try every substring whose length is within the allowed range.
function reference({ s, maxLetters, minSize, maxSize }) {
  const occurrences = new Map()
  for (let len = minSize; len <= maxSize; len++) {
    for (let i = 0; i + len <= s.length; i++) {
      const sub = s.slice(i, i + len)
      if (new Set(sub).size <= maxLetters) occurrences.set(sub, (occurrences.get(sub) ?? 0) + 1)
    }
  }
  return Math.max(0, ...occurrences.values())
}

test('repeated pair example counts aa three times', () => {
  assert.equal(buildTrace({ s: 'aabbaabbaa', maxLetters: 2, minSize: 2, maxSize: 4 }).result, 3)
})

test('three-letter cycle example', () => {
  assert.equal(buildTrace({ s: 'abcabcabc', maxLetters: 2, minSize: 2, maxSize: 3 }).result, 3)
})

test('no eligible window gives zero', () => {
  assert.equal(buildTrace({ s: 'abcdef', maxLetters: 1, minSize: 2, maxSize: 3 }).result, 0)
})

test('random strings agree with the all-lengths reference', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rand(14) }, () => 'abc'[rand(3)]).join('')
    const minSize = 1 + rand(3)
    const input = { s, maxLetters: 1 + rand(3), minSize, maxSize: minSize + rand(3) }
    assert.equal(buildTrace(input).result, reference(input), JSON.stringify(input))
  }
})

test('every frame names a real phase and a code line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace({ s: 'aabbaabbaa', maxLetters: 2, minSize: 2, maxSize: 4 })
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[1]'), /Use an object/)
  assert.throws(() => parseInput('{"s":"AB","maxLetters":1,"minSize":1,"maxSize":1}'), /lowercase/)
  assert.throws(() => parseInput('{"s":"ab","maxLetters":1,"minSize":3,"maxSize":2}'), /maxSize/)
})
