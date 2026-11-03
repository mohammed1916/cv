import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, phases, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

function checkFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 0)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('own examples: an exposed pair, a full cancellation and no duplicates', () => {
  assert.equal(solve('mnoonpq'), 'mpq')
  assert.equal(solve('xxyyzz'), '')
  assert.equal(solve('abcde'), 'abcde')
})

test('an odd run leaves one character behind', () => {
  assert.equal(solve('kkkq'), 'kq')
})

test('frames alternate between comparing and pushing or popping', () => {
  const run = buildTrace(parseInput('mnoonpq'))
  checkFrames(run)
  const pops = run.frames.filter(f => f.phase === 'pop').length
  assert.equal(pops, 2)
})

test('invalid inputs are rejected by the parser', () => {
  assert.throws(() => parseInput(''))
  assert.throws(() => parseInput('ABC'))
  assert.throws(() => parseInput('a'.repeat(21)))
  assert.throws(() => parseInput('ab1'))
})

// Independent oracle: repeatedly delete the first adjacent equal pair until none remain.
function oracle(s) {
  let t = s
  let changed = true
  while (changed) {
    changed = false
    for (let i = 0; i + 1 < t.length; i++) {
      if (t[i] === t[i + 1]) { t = t.slice(0, i) + t.slice(i + 2); changed = true; break }
    }
  }
  return t
}

test('seeded random strings agree with repeated deletion', () => {
  let seed = 1047
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    let s = ''
    const len = 1 + rnd(20)
    for (let i = 0; i < len; i++) s += 'abc'[rnd(3)]
    assert.equal(solve(s), oracle(s), s)
  }
})
