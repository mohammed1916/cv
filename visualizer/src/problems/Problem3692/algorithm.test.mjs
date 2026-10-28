import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// The statement allows any order, so the tests compare the sorted letters.
const solve = s => buildTrace(s).result

test('3692 official examples', () => {
  assert.equal(solve('aaabbbccdddde'), 'ab')
  assert.equal(solve('abcd'), 'abcd')
  assert.equal(solve('pfpfgi'), 'fp')
})

test('3692 a tie on size goes to the larger frequency', () => {
  // Frequency 3 holds x and y (size 2); frequency 1 holds z and w (size 2). Frequency 3 is larger.
  assert.equal(solve('xxxyyyzw'), 'xy')
})

test('3692 rejects characters outside a to z', () => {
  assert.throws(() => parseInput('"AB"'))
  assert.throws(() => parseInput('""'))
})

// Independent oracle: count letters with split, rank frequencies by (size, k), and take the top one.
function oracle(s) {
  const letters = [...new Set(s)]
  const freq = c => s.split(c).length - 1
  const sizes = new Map()
  for (const c of letters) sizes.set(freq(c), (sizes.get(freq(c)) || 0) + 1)
  const ranked = [...sizes.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])
  const k = ranked[0][0]
  return letters.filter(c => freq(c) === k).sort().join('')
}

test('3692 random strings match a split-count oracle', () => {
  let seed = 3692
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const alphabet = 1 + rnd(8)
    let s = ''
    const length = 1 + rnd(30)
    for (let i = 0; i < length; i++) s += String.fromCharCode(97 + rnd(alphabet))
    assert.equal(solve(s), oracle(s), s)
  }
})
