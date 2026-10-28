import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

test('3628 official examples', () => {
  assert.equal(solve('LMCT'), 2)
  assert.equal(solve('LCCT'), 4)
  assert.equal(solve('L'), 0)
})

test('3628 a string with no L or T gains nothing', () => {
  assert.equal(solve('CCC'), 0)
})

test('3628 rejects lowercase letters and an empty string', () => {
  assert.throws(() => parseInput('"lct"'))
  assert.throws(() => parseInput('""'))
})

// Independent oracle: try every insertion of every uppercase letter at every position, and count LCT by dynamic programming.
function countLCT(t) {
  let l = 0, lc = 0, lct = 0
  for (const ch of t) {
    if (ch === 'L') l++
    else if (ch === 'C') lc += l
    else if (ch === 'T') lct += lc
  }
  return lct
}
function oracle(s) {
  let best = countLCT(s)
  for (let p = 0; p <= s.length; p++) {
    for (let code = 65; code <= 90; code++) {
      const t = s.slice(0, p) + String.fromCharCode(code) + s.slice(p)
      best = Math.max(best, countLCT(t))
    }
  }
  return best
}

test('3628 random strings match an all-insertions oracle', () => {
  let seed = 3628
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'LCTAB'
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(10)
    let s = ''
    for (let i = 0; i < len; i++) s += alphabet[rnd(alphabet.length)]
    assert.equal(solve(s), oracle(s), s)
  }
})
