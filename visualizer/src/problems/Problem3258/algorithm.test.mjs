import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

test('3258 official examples', () => {
  assert.equal(solve('10101', 1), 12)
  assert.equal(solve('1010101', 2), 25)
  assert.equal(solve('11111', 1), 15)
})

test('3258 k equal to the length counts every substring', () => {
  assert.equal(solve('0101', 4), 10)
})

test('3258 rejects characters other than 0 and 1', () => {
  assert.throws(() => parseInput('{"s":"012","k":1}'))
})

// Independent oracle: test every substring directly by counting its zeros and ones.
function oracle(s, k) {
  let total = 0
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      const part = s.slice(i, j + 1)
      const zeros = part.split('0').length - 1
      const ones = part.length - zeros
      if (zeros <= k || ones <= k) total++
    }
  }
  return total
}

test('3258 random strings match a brute-force oracle', () => {
  let seed = 3258
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(14)
    let s = ''
    for (let i = 0; i < len; i++) s += rnd(2) ? '1' : '0'
    const k = rnd(len + 1)
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})
