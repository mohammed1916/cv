import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = password => buildTrace(parseInput(JSON.stringify({ password }))).result

test('2299 official examples', () => {
  assert.equal(solve('IloveLe3tcode!'), true)
  assert.equal(solve('Me+You--IsMyDream'), false)
  assert.equal(solve('1aB!'), false)
})

test('2299 edge cases: exactly 8 characters and each missing class', () => {
  assert.equal(solve('aB3!xyzq'), true)
  assert.equal(solve('aB3!xyz'), false)
  assert.equal(solve('ABCDEF3!'), false)
  assert.equal(solve('abcdef3!'), false)
  assert.equal(solve('abcdefG!'), false)
  assert.equal(solve('abcdefG3'), false)
})

test('2299 rejects spaces and empty passwords', () => {
  assert.throws(() => parseInput('{"password":""}'))
  assert.throws(() => parseInput('{"password":"ab cdefG3!"}'))
})

// Independent oracle: one regular expression with lookaheads for the four classes and no adjacent repeat.
const PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-+])(?!.*(.)\1).{8,}$/

test('2299 random passwords match a regular-expression oracle', () => {
  let seed = 2299
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const password = Array.from({ length: 1 + rnd(12) }, () => 'aA1!b-'[rnd(6)]).join('')
    assert.equal(solve(password), PATTERN.test(password), password)
  }
})
