import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = spec => buildTrace(spec).result

test('734 official examples', () => {
  assert.equal(solve({
    s1: ['great', 'acting', 'skills'], s2: ['fine', 'drama', 'talent'],
    pairs: [['great', 'fine'], ['acting', 'drama'], ['skills', 'talent']],
  }), true)
  assert.equal(solve({
    s1: ['an', 'extraordinary', 'meal'], s2: ['one', 'good', 'dinner'],
    pairs: [['great', 'good'], ['extraordinary', 'good'], ['well', 'good'], ['any', 'one'], ['some', 'one']],
  }), false)
})

test('734 similarity does not chain', () => {
  // a~b and b~c do not make a~c.
  assert.equal(solve({ s1: ['a'], s2: ['c'], pairs: [['a', 'b'], ['b', 'c']] }), false)
})

test('734 rejects a pair that is not two words', () => {
  assert.throws(() => parseInput('{"s1":["a"],"s2":["a"],"pairs":[["a"]]}'))
})

// Independent oracle: check each position against the pair list directly, in both orders.
function oracle({ s1, s2, pairs }) {
  if (s1.length !== s2.length) return false
  return s1.every((a, i) => {
    const b = s2[i]
    return a === b || pairs.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
  })
}

test('734 random sentences match an oracle', () => {
  let seed = 37
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const words = ['a', 'b', 'c', 'd']
  for (let t = 0; t < 400; t++) {
    const pairs = Array.from({ length: rnd(5) }, () => [words[rnd(4)], words[rnd(4)]])
    const s1 = Array.from({ length: rnd(4) }, () => words[rnd(4)])
    const s2 = s1.map(w => (rnd(2) ? w : words[rnd(4)]))
    if (rnd(5) === 0) s2.push('a')
    const spec = { s1, s2, pairs }
    assert.equal(solve(spec), oracle(spec), JSON.stringify(spec))
  }
})
