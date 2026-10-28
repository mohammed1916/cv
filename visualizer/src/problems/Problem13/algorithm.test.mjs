import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

test('13 official examples', () => {
  assert.equal(solve('III'), 3)
  assert.equal(solve('LVIII'), 58)
  assert.equal(solve('MCMXCIV'), 1994)
})

test('13 subtractive pairs and a single symbol', () => {
  assert.equal(solve('IV'), 4)
  assert.equal(solve('IX'), 9)
  assert.equal(solve('XLIX'), 49)
  assert.equal(solve('I'), 1)
})

test('13 rejects non-canonical text and wrong characters', () => {
  assert.throws(() => parseInput('"IIII"'))
  assert.throws(() => parseInput('"VX"'))
  assert.throws(() => parseInput('"abc"'))
  assert.throws(() => parseInput('""'))
})

// Independent oracle: decompose the number with fixed digit tables and check each numeral parses back.
const DIGITS = [['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'], ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'],
  ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'], ['', 'M', 'MM', 'MMM']]
function numeral(n) {
  return DIGITS[3][Math.floor(n / 1000)] + DIGITS[2][Math.floor(n / 100) % 10] + DIGITS[1][Math.floor(n / 10) % 10] + DIGITS[0][n % 10]
}

test('13 every value 1 to 3999 round-trips through the oracle numerals', () => {
  for (let n = 1; n <= 3999; n++) assert.equal(solve(numeral(n)), n, numeral(n))
})

test('13 seeded random numerals match the digit-table oracle', () => {
  let seed = 13
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(3999)
    assert.equal(solve(numeral(n)), n)
  }
})
