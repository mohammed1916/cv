import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, phases } from './algorithm.js'

const VOWELS = 'aeiou'
const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

// Independent oracle: test every substring directly.
function brute(s) {
  let best = 0
  for (let l = 0; l < s.length; l++) {
    const counts = [0, 0, 0, 0, 0]
    for (let r = l; r < s.length; r++) {
      const v = VOWELS.indexOf(s[r])
      if (v >= 0) counts[v] += 1
      if (counts.every(c => c % 2 === 0)) best = Math.max(best, r - l + 1)
    }
  }
  return best
}

test('hand-checked strings', () => {
  assert.equal(solve('aa'), 2)
  assert.equal(solve('aeiou'), 0)
  assert.equal(solve('xaabyy'), 6)
  assert.equal(solve('ab'), 1)
})

test('random strings agree with the all-substrings oracle', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return (state >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rand(30)
    const s = Array.from({ length: len }, () => 'aeioubcxy'[rand(9)]).join('')
    assert.equal(solve(s), brute(s), s)
  }
})

test('the mask frames show parity changes and a match gives a substring range', () => {
  const run = buildTrace(parseInput('{"s":"aa"}'))
  assert.equal(run.result, 2)
  assert.equal(run.frames.at(-1).snapshot.bestRange[1] - run.frames.at(-1).snapshot.bestRange[0], 2)
})

test('every frame carries a phase, a code line, narration and a snapshot', () => {
  const run = buildTrace(parseInput('{"s":"leetcodes"}'))
  const ids = phases.map(p => p.id)
  for (const frame of run.frames) {
    assert.ok(ids.includes(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid input is rejected with a message', () => {
  assert.throws(() => parseInput('{"s":"Vowel"}'), /lowercase/)
})
