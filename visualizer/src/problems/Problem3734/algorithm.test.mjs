import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, target) => buildTrace(parseInput(JSON.stringify({ s, target }))).result

test('3734 official examples', () => {
  assert.equal(solve('baba', 'abba'), 'baab')
  assert.equal(solve('baba', 'bbaa'), '')
  assert.equal(solve('abc', 'abb'), '')
  assert.equal(solve('aac', 'abb'), 'aca')
})

test('3734 an equal palindrome is not strictly greater', () => {
  assert.equal(solve('aa', 'aa'), '')
  assert.equal(solve('aa', 'ab'), '')
})

test('3734 rejects unequal lengths', () => {
  assert.throws(() => parseInput('{"s":"aa","target":"aaa"}'))
})

// Independent oracle: list all distinct permutations of s, keep palindromes above target, take the minimum.
function oracle(s, target) {
  const out = new Set()
  const walk = (prefix, rest) => {
    if (!rest.length) { out.add(prefix); return }
    for (let i = 0; i < rest.length; i++) walk(prefix + rest[i], rest.slice(0, i) + rest.slice(i + 1))
  }
  walk('', s)
  const good = [...out].filter(p => p === p.split('').reverse().join('') && p > target).sort()
  return good.length ? good[0] : ''
}

let seed = 3734
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3734 seeded random against palindrome oracle', () => {
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(6)
    const L = () => String.fromCharCode(97 + rnd(3))
    const s = Array.from({ length: n }, L).join('')
    const target = Array.from({ length: n }, L).join('')
    assert.equal(solve(s, target), oracle(s, target), JSON.stringify({ s, target }))
  }
})
