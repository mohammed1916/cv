import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = (numerator, denominator) => buildTrace({ numerator, denominator }).result

test('166 teaching cases return the expected strings', () => {
  assert.equal(solve(1, 2), '0.5')
  assert.equal(solve(2, 1), '2')
  assert.equal(solve(2, 3), '0.(6)')
  assert.equal(solve(4, 333), '0.(012)')
  assert.equal(solve(1, 6), '0.1(6)')
  assert.equal(solve(-1, 2), '-0.5')
  assert.equal(solve(1, -2), '-0.5')
  assert.equal(solve(-1, -2), '0.5')
  assert.equal(solve(0, 5), '0')
  assert.equal(solve(7, -12), '-0.58(3)')
  assert.equal(solve(1, 9), '0.(1)')
})

test('166 rejects malformed input', () => {
  assert.throws(() => parseInput('{"numerator":1,"denominator":0}'), /denominator/)
  assert.throws(() => parseInput('{"numerator":1.5,"denominator":2}'), /numerator/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})

// Independent oracle: rebuild the rational value from the printed digits with BigInt and compare by cross-multiplication.
function valueOf(text) {
  const negative = text.startsWith('-')
  const body = negative ? text.slice(1) : text
  const [wholeText, fractionText = ''] = body.split('.')
  const open = fractionText.indexOf('(')
  const nonRepeat = open === -1 ? fractionText : fractionText.slice(0, open)
  const repeat = open === -1 ? '' : fractionText.slice(open + 1, -1)
  const a = BigInt(nonRepeat.length)
  const whole = BigInt(wholeText)
  let num
  let den
  if (repeat === '') {
    den = 10n ** a
    num = whole * den + (nonRepeat === '' ? 0n : BigInt(nonRepeat))
  } else {
    const b = BigInt(repeat.length)
    const tail = 10n ** b - 1n
    den = (10n ** a) * tail
    num = whole * den + (nonRepeat === '' ? 0n : BigInt(nonRepeat)) * tail + BigInt(repeat)
  }
  return { negative, num, den }
}

test('166 results rebuild the exact fraction for many inputs', () => {
  let seed = 5
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 500; t++) {
    const numerator = rnd(2001) - 1000
    const denominator = (rnd(2) ? 1 : -1) * (1 + rnd(400))
    const text = solve(numerator, denominator)
    const value = valueOf(text)
    const sign = numerator !== 0 && (numerator < 0) !== (denominator < 0)
    assert.equal(value.negative, sign, text)
    const n = BigInt(Math.abs(numerator))
    const d = BigInt(Math.abs(denominator))
    assert.equal(value.num * d, n * value.den, `${numerator}/${denominator} -> ${text}`)
    assert.ok(!/\(\)/.test(text), text)
  }
})

test('166 frames point to valid code and Python lines', () => {
  const { frames } = buildTrace({ numerator: 4, denominator: 333 })
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of frames) {
    assert.ok(phaseIds.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
  }
})
