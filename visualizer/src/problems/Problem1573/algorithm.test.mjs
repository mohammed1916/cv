import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('1573 examples with ones and without ones', () => {
  assert.equal(solve('10101'), 4)
  assert.equal(solve('0000'), 3)
})

test('1573 a string of three ones has exactly one split', () => {
  assert.equal(solve('111'), 1)
})

test('1573 a count of ones that is not a multiple of three gives zero', () => {
  assert.equal(solve('1001'), 0)
})

test('1573 rejects a character other than 0 or 1', () => {
  assert.throws(() => parseInput('{"s":"012"}'))
})

// Independent oracle: try every pair of cut points and count the ones in each part.
function oracle(s) {
  const n = s.length
  const ones = (a, b) => [...s.slice(a, b)].filter(c => c === '1').length
  let ways = 0
  for (let i = 1; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = ones(0, i)
      if (a === ones(i, j) && a === ones(j, n)) ways++
    }
  }
  return ways % 1000000007
}

test('1573 seeded random strings match a cut-pair oracle', () => {
  let seed = 1573
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 3 + rnd(10)
    const s = Array.from({ length: len }, () => (rnd(3) === 0 ? '1' : '0')).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
