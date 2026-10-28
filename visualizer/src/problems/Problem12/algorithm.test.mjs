import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify(n))).result

test('12 official examples', () => {
  assert.equal(solve(3), 'III')
  assert.equal(solve(4), 'IV')
  assert.equal(solve(9), 'IX')
  assert.equal(solve(58), 'LVIII')
  assert.equal(solve(1994), 'MCMXCIV')
})

test('12 edge values at the ends of the range', () => {
  assert.equal(solve(1), 'I')
  assert.equal(solve(3999), 'MMMCMXCIX')
})

test('12 rejects values outside 1 to 3999 and non-integers', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('4000'))
  assert.throws(() => parseInput('2.5'))
})

// Independent oracle: build each numeral digit by digit from fixed tables, then check it against a
// regular expression for canonical Roman numerals and parse it back with a different reader.
const DIGITS = [['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'], ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'],
  ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'], ['', 'M', 'MM', 'MMM']]
const CANON = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/
const VALUE = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
function oracle(n) {
  const d = [n % 10, Math.floor(n / 10) % 10, Math.floor(n / 100) % 10, Math.floor(n / 1000)]
  return DIGITS[3][d[3]] + DIGITS[2][d[2]] + DIGITS[1][d[1]] + DIGITS[0][d[0]]
}
function readBack(s) {
  // Parse by matching fixed tokens from the left, a different method from the trace.
  let total = 0
  const tokens = [['M', 1000], ['CM', 900], ['D', 500], ['CD', 400], ['C', 100], ['XC', 90], ['L', 50], ['XL', 40], ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]]
  let rest = s
  while (rest.length) {
    const [tok, v] = tokens.find(([t]) => rest.startsWith(t))
    total += v
    rest = rest.slice(tok.length)
  }
  return total
}

test('12 every value 1 to 3999 matches the digit-table oracle', () => {
  for (let n = 1; n <= 3999; n++) {
    const expected = oracle(n)
    assert.ok(CANON.test(expected), expected)
    assert.equal(solve(n), expected)
    assert.equal(readBack(solve(n)), n)
  }
  assert.ok(Object.keys(VALUE).length === 7)
})

test('12 seeded random values match the digit-table oracle', () => {
  let seed = 12
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(3999)
    assert.equal(solve(n), oracle(n), String(n))
  }
})
