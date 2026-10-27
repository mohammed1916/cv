import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

test('2516 official examples', () => {
  assert.equal(solve('aabaaaacaabc', 2), 8)
  assert.equal(solve('a', 1), -1)
  assert.equal(solve('abc', 1), 3)
})

test('2516 an already satisfied string needs no moves', () => {
  assert.equal(solve('abcabc', 0), 0)
})

test('2516 rejects letters outside a to c', () => {
  assert.throws(() => parseInput('{"s":"abd","k":1}'))
})

// Independent oracle: try every number of minutes t and every split a + (t - a) between the left and right ends.
function oracle(s, k) {
  const n = s.length
  const enough = part => ['a', 'b', 'c'].every(ch => part.split(ch).length - 1 >= k)
  for (let t = 0; t <= n; t++) {
    for (let a = 0; a <= t; a++) {
      const taken = s.slice(0, a) + s.slice(n - (t - a))
      if (enough(taken)) return t
    }
  }
  return -1
}

test('2516 random strings match a split-enumeration oracle', () => {
  let seed = 2516
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    let s = ''
    for (let i = 0; i < len; i++) s += 'abc'[rnd(3)]
    const k = rnd(len + 1)
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})
