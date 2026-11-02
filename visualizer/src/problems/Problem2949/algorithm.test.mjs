import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).result

test('2949 worked examples', () => {
  assert.equal(solve('baeyh', 2), 2)
  assert.equal(solve('abba', 1), 3)
  assert.equal(solve('bcdf', 1), 0)
})

test('2949 edge cases', () => {
  assert.equal(solve('a', 1), 0)
  assert.equal(solve('ae', 1), 0)
  assert.equal(solve('ab', 1), 1)
  assert.throws(() => parseInput('{"s":"ab","k":0}'))
})

// Independent oracle: test every substring against the statement's own definition.
function oracle(s, k) {
  const vow = 'aeiou'
  let count = 0
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j <= s.length; j++) {
      const t = s.slice(i, j)
      const v = [...t].filter(ch => vow.includes(ch)).length
      const c = t.length - v
      if (v === c && (v * c) % k === 0) count++
    }
  }
  return count
}

test('2949 random strings match a substring oracle', () => {
  let seed = 2949
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'aeibcdy'
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(12) }, () => letters[rnd(letters.length)]).join('')
    const k = 1 + rnd(6)
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})
