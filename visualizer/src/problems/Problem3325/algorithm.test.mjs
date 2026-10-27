import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3325 official examples', () => {
  assert.equal(solve({ s: 'abacb', k: 2 }), 4)
  assert.equal(solve({ s: 'abcde', k: 1 }), 15)
})

test('3325 rejects k of zero', () => {
  assert.throws(() => parseInput('{"s":"abc","k":0}'))
})

// Independent oracle: for every substring, check whether some letter reaches k occurrences.
function oracle({ s, k }) {
  let count = 0
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      const part = s.slice(i, j + 1)
      const best = Math.max(...[...new Set(part)].map(c => part.split(c).length - 1))
      if (best >= k) count++
    }
  }
  return count
}

test('3325 seeded random strings match substring enumeration', () => {
  let seed = 3325
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    let s = ''
    const length = 1 + rnd(12)
    for (let i = 0; i < length; i++) s += 'abc'[rnd(3)]
    const input = { s, k: 1 + rnd(5) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
