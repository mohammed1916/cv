import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

// Direct reference: test every substring.
function brute(s) {
  let count = 0
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      if (s.slice(i, j + 1).split('').every(ch => ch === s[i])) count++
    }
  }
  return count
}

test('samples: aaabb gives 9, abc gives 3, zzzzz gives 15, a gives 1', () => {
  assert.equal(buildTrace('aaabb').result, 9)
  assert.equal(buildTrace('abc').result, 3)
  assert.equal(buildTrace('zzzzz').result, 15)
  assert.equal(buildTrace('a').result, 1)
})

test('random strings agree with the all-substrings reference', () => {
  let seed = 1180
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(20)
    const s = Array.from({ length: n }, () => 'abc'[rnd(3)]).join('')
    assert.equal(buildTrace(s).result, brute(s), s)
  }
})

test('parseInput accepts lowercase letters and rejects others', () => {
  assert.equal(parseInput(' aab '), 'aab')
  for (const bad of ['', 'AB', 'a1', 'x'.repeat(51)]) assert.throws(() => parseInput(bad))
})

test('every frame names a declared phase and a code line, and the last frame is done', () => {
  const run = buildTrace('aaabb')
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase), frame.phase)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).snapshot.total, 9)
})
