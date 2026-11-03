import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(s).result

test('3167 worked strings', () => {
  assert.equal(solve('b12a3b4'), 'a3b16')
  assert.equal(solve('z1'), 'z1')
  assert.equal(solve('c2c2c2a10a1'), 'a11c6')
  assert.equal(solve('a1b1c1'), 'a1b1c1')
})

// Oracle: a plain map of letter totals, rebuilt with a regular expression.
function oracle(s) {
  const totals = new Map()
  for (const [, letter, digits] of s.matchAll(/([a-z])(\d+)/g)) {
    totals.set(letter, (totals.get(letter) ?? 0) + Number(digits))
  }
  return [...totals.keys()].sort().map(letter => `${letter}${totals.get(letter)}`).join('')
}

test('3167 random groups match a map-based oracle', () => {
  let seed = 3167
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 300; trial++) {
    const groups = Array.from({ length: 1 + rnd(8) }, () => 'abcd'[rnd(4)] + (1 + rnd(40)))
    const s = groups.join('')
    assert.equal(solve(s), oracle(s), s)
  }
})

test('3167 frames carry real pseudocode and python lines and the totals', () => {
  const run = buildTrace('b12a3b4')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 11, `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 16, `pythonLine ${frame.pythonLine}`)
    assert.equal(frame.totals.length, 26)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('3167 parse rejects missing frequencies and bad letters', () => {
  assert.throws(() => parseInput('"a"'))
  assert.throws(() => parseInput('"A3"'))
  assert.throws(() => parseInput('"a03"'))
  assert.throws(() => parseInput('"a1234567"'))
  assert.equal(parseInput('"a3c9"'), 'a3c9')
})
