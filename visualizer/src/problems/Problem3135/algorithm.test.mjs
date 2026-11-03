import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, t) => buildTrace({ s, t }).result

test('3135 worked values', () => {
  assert.equal(solve('xxhelloyy', 'hello'), 4)
  assert.equal(solve('abc', 'xyz'), 6)
  assert.equal(solve('stone', 'tones'), 2)
  assert.equal(solve('ab', 'ba'), 2)
  assert.equal(solve('abc', 'abc'), 0)
})

// Oracle: try every substring of s, keep those that also appear in t, and take the longest.
function oracle(s, t) {
  let best = 0
  for (let i = 0; i < s.length; i++) {
    for (let len = 1; i + len <= s.length; len++) {
      if (t.includes(s.slice(i, i + len))) best = Math.max(best, len)
    }
  }
  return s.length + t.length - 2 * best
}

test('3135 random strings match a substring oracle', () => {
  let seed = 3135
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let trial = 0; trial < 400; trial++) {
    const s = word(1 + rnd(7))
    const t = word(1 + rnd(7))
    assert.equal(solve(s, t), oracle(s, t), JSON.stringify({ s, t }))
  }
})

test('3135 frames carry real pseudocode and python lines and the table', () => {
  const run = buildTrace({ s: 'stone', t: 'tones' })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 9, `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 13, `pythonLine ${frame.pythonLine}`)
    assert.equal(frame.table.length, 6)
    assert.equal(frame.table[0].length, 6)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('3135 parse rejects strings outside the visualization alphabet and length', () => {
  assert.throws(() => parseInput('{"s":"","t":"a"}'))
  assert.throws(() => parseInput('{"s":"AB","t":"a"}'))
  assert.throws(() => parseInput('{"s":"abcdefghijklm","t":"a"}'))
  assert.throws(() => parseInput('["ab","cd"]'))
  assert.deepEqual(parseInput('{"s":"ab","t":"ba"}'), { s: 'ab', t: 'ba' })
})
