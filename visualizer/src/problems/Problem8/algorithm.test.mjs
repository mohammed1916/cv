import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

test('8 official examples', () => {
  assert.equal(solve('42'), 42)
  assert.equal(solve('   -42'), -42)
  assert.equal(solve('4193 with words'), 4193)
  assert.equal(solve('words and 987'), 0)
  assert.equal(solve('-91283472332'), -2147483648)
})

test('8 sign, space and clamp edge cases', () => {
  assert.equal(solve('+-12'), 0)
  assert.equal(solve('  +0 123'), 0)
  assert.equal(solve(''), 0)
  assert.equal(solve('2147483648'), 2147483647)
  assert.equal(solve('-2147483649'), -2147483648)
})

test('8 rejects characters outside the allowed set and long input', () => {
  assert.throws(() => parseInput('"a\\tb"'))
  assert.throws(() => parseInput(JSON.stringify('1'.repeat(201))))
})

// Independent oracle: a regular expression for optional spaces, an optional sign, then digits.
function oracle(s) {
  const m = /^ *([+-]?[0-9]+)/.exec(s)
  if (!m) return 0
  const v = Number(m[1]) + 0
  return Math.min(2 ** 31 - 1, Math.max(-(2 ** 31), v))
}

test('8 seeded random strings match a regular-expression oracle', () => {
  let seed = 8
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = [' ', ' ', '+', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '9', 'x', '.']
  for (let t = 0; t < 400; t++) {
    let s = ''
    const len = rnd(14)
    for (let k = 0; k < len; k++) s += alphabet[rnd(alphabet.length)]
    if (rnd(3) === 0) s += '9'.repeat(rnd(14))
    assert.equal(solve(s), oracle(s), JSON.stringify(s))
  }
})
