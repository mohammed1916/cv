import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2381 statement examples', () => {
  assert.equal(solve({ s: 'abc', shifts: [[0, 1, 0], [1, 2, 1], [0, 2, 1]] }), 'ace')
  assert.equal(solve({ s: 'dztz', shifts: [[0, 0, 0], [1, 1, 1]] }), 'catz')
})

test('2381 rejects an uppercase letter', () => {
  assert.throws(() => parseInput('{"s":"aBc","shifts":[[0,0,1]]}'))
})

// Independent oracle: apply every shift to each letter by scanning the shift list.
function oracle({ s, shifts }) {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    let net = 0
    for (const [a, b, d] of shifts) if (a <= i && i <= b) net += d === 1 ? 1 : -1
    out += String.fromCharCode(97 + (((s.charCodeAt(i) - 97 + net) % 26) + 26) % 26)
  }
  return out
}

test('2381 random cases match a per-letter oracle', () => {
  let seed = 2381
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    const s = Array.from({ length: len }, () => String.fromCharCode(97 + rnd(26))).join('')
    const shifts = Array.from({ length: 1 + rnd(6) }, () => { const a = rnd(len); return [a, a + rnd(len - a), rnd(2)] })
    const input = { s, shifts }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
