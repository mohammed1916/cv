import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('2390 official examples', () => {
  assert.equal(solve('leet**cod*e'), 'lecoe')
  assert.equal(solve('erase*****'), '')
})

test('2390 stars can cascade', () => {
  assert.equal(solve('ab**c'), 'c')
})

test('2390 rejects a star with nothing to its left', () => {
  assert.throws(() => parseInput('{"s":"*a"}'))
})

// Independent oracle: repeatedly delete the first letter that is immediately followed by a star.
function oracle(s) {
  let t = s
  while (/[a-z]\*/.test(t)) t = t.replace(/[a-z]\*/, '')
  return t
}

test('2390 random strings match a regex-deletion oracle', () => {
  let seed = 2390
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(14)
    let letters = 0
    let s = ''
    for (let k = 0; k < len; k++) {
      if (letters > 0 && rnd(3) === 0) { s += '*'; letters-- } else { s += 'abc'[rnd(3)]; letters++ }
    }
    assert.equal(solve(s), oracle(s), s)
  }
})
