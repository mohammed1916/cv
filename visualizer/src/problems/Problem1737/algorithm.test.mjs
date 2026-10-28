import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: for every pair of letters x < y, count changes per character;
// also every single target letter for the same-letter rule.
function oracle({ a, b }) {
  const L = s => [...s].map(ch => ch.charCodeAt(0) - 97)
  const A = L(a)
  const B = L(b)
  let best = Infinity
  for (let c = 0; c < 26; c++) {
    best = Math.min(best, A.filter(v => v !== c).length + B.filter(v => v !== c).length)
  }
  for (let x = 0; x < 26; x++) {
    for (let y = x + 1; y < 26; y++) {
      best = Math.min(best, A.filter(v => v > x).length + B.filter(v => v < y).length)
      best = Math.min(best, B.filter(v => v > x).length + A.filter(v => v < y).length)
    }
  }
  return best
}

test('1737 examples', () => {
  assert.equal(solve({ a: 'aba', b: 'caa' }), 2)
  assert.equal(solve({ a: 'dabadd', b: 'cda' }), 3)
})

test('1737 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"a":"AB","b":"cd"}'))
})

test('1737 random strings match a per-character oracle', () => {
  let seed = 1737
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = () => Array.from({ length: 1 + rnd(8) }, () => String.fromCharCode(97 + rnd(26))).join('')
  for (let t = 0; t < 300; t++) {
    const input = { a: word(), b: word() }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
