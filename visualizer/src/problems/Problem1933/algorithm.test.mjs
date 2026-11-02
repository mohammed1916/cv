import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = s => buildTrace(parseInput(s)).result

test('1933 worked examples', () => {
  assert.equal(solve('11122'), true)
  assert.equal(solve('00111'), true)
  assert.equal(solve('2222'), false)
  assert.equal(solve('111222333'), false)
})

test('1933 rejects invalid input', () => {
  assert.throws(() => parseInput(''))
  assert.throws(() => parseInput('12a'))
  assert.throws(() => parseInput('1'.repeat(21)))
})

// Oracle: enumerate every split into contiguous blocks of length 2 or 3.
function oracle(s) {
  const n = s.length
  const go = (i, twos) => {
    if (i === n) return twos === 1
    for (const length of [2, 3]) {
      if (i + length > n) continue
      const block = s.slice(i, i + length)
      if (![...block].every(c => c === block[0])) continue
      const next = twos + (length === 2 ? 1 : 0)
      if (next <= 1 && go(i + length, next)) return true
    }
    return false
  }
  return go(0, 0)
}

test('1933 random strings match a brute-force split oracle', () => {
  let seed = 1933
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const s = Array.from({ length: 1 + rnd(12) }, () => String(rnd(3))).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})

test('1933 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const s of ['11122', '2222', '00111']) {
    for (const frame of buildTrace(parseInput(s)).frames) {
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
      assert.ok(frame.message.length > 0)
    }
  }
})
