import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (num, t) => buildTrace({ num, t }).result

// Oracle: scan upward from num for a zero-free number whose digit product is divisible by t.
function brute(num, t, bound) {
  for (let v = Number(num); v < bound; v++) {
    const s = String(v)
    if (s.includes('0')) continue
    let p = 1
    for (const ch of s) p *= Number(ch)
    if (p % t === 0) return s
  }
  return null
}

test('3348 small worked cases', () => {
  assert.equal(solve('1234', 256), '1488')
  assert.equal(solve('12355', 50), '12355')
  assert.equal(solve('11111', 26), '-1')
})

test('3348 t with another prime factor is impossible', () => {
  assert.equal(solve('1', 11), '-1')
})

test('3348 agrees with a scan on small inputs', () => {
  let s = 7
  const rand = n => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s % n }
  for (let trial = 0; trial < 60; trial++) {
    const len = 1 + rand(3)
    let num = String(1 + rand(9))
    for (let i = 1; i < len; i++) num += String(rand(10))
    const t = 1 + rand(100)
    const bound = 10 ** (len + 2)
    const expect = brute(num, t, bound)
    const got = solve(num, t)
    if (expect !== null) assert.equal(got, expect, `num=${num} t=${t}`)
    else assert.ok(got === '-1' || got.length > len + 2, `num=${num} t=${t} got ${got}`)
  }
})

test('3348 rejects malformed input', () => {
  assert.throws(() => parseInput('{"num":"0","t":2}'))
  assert.throws(() => parseInput('{"num":"12","t":0}'))
})
