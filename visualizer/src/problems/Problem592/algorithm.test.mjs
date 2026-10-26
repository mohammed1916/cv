import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('592 official examples', () => {
  const run = text => buildTrace(parseInput(JSON.stringify(text))).result
  assert.equal(run('-1/2+1/2'), '0/1')
  assert.equal(run('-1/2+1/2+1/3'), '1/3')
  assert.equal(run('1/3-1/2'), '-1/6')
  assert.equal(run('5/3+1/3'), '2/1')
})

test('592 random expressions match an unreduced big-integer oracle', () => {
  let state = 3
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 400; t++) {
    const k = 1 + rand(5)
    const terms = Array.from({ length: k }, () => ({ n: rand(19) - 9, d: 1 + rand(10) }))
    const text = terms.map(({ n, d }) => `${n < 0 ? '' : '+'}${n}/${d}`).join('')
    const parsed = parseInput(JSON.stringify(text.replace(/^\+/, '')))
    // Oracle: common denominator is the product of all denominators, then reduce by gcd.
    let D = 1n, N = 0n
    for (const { d } of terms) D *= BigInt(d)
    for (const { n, d } of terms) N += BigInt(n) * (D / BigInt(d))
    let a = N < 0n ? -N : N, b = D
    while (b) [a, b] = [b, a % b]
    const g = a || 1n
    const expected = `${N / g}/${D / g}`
    assert.equal(buildTrace(parsed).result, expected, text)
  }
})

test('592 rejects malformed fractions', () => {
  assert.throws(() => parseInput('"1/0"'))
  assert.throws(() => parseInput('"1/2+"'))
})
