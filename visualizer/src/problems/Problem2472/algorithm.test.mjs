import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

test('2472 examples worked out by hand', () => {
  assert.equal(solve('abaccbdb', 3), 2)
  assert.equal(solve('ten', 1), 3)
})

test('2472 a long palindrome can block two short ones', () => {
  assert.equal(solve('aaaa', 4), 1)
  assert.equal(solve('aaaa', 2), 2)
})

test('2472 rejects k larger than s', () => {
  assert.throws(() => parseInput('{"s":"ab","k":3}'))
})

// Independent oracle: list every palindrome of length at least k, then search all sets of disjoint ones.
function oracle(s, k) {
  const n = s.length
  const isPal = (i, j) => {
    const t = s.slice(i, j + 1)
    return t === [...t].reverse().join('')
  }
  const intervals = []
  for (let i = 0; i < n; i++) {
    for (let j = i + k - 1; j < n; j++) if (isPal(i, j)) intervals.push([i, j])
  }
  let best = 0
  const search = (index, freeFrom, count) => {
    best = Math.max(best, count)
    for (let t = index; t < intervals.length; t++) {
      if (intervals[t][0] >= freeFrom) search(t + 1, intervals[t][1] + 1, count + 1)
    }
  }
  search(0, 0, 0)
  return best
}

test('2472 random strings match an exhaustive disjoint-set oracle', () => {
  let seed = 2472
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const len = 1 + rnd(9)
    let s = ''
    for (let i = 0; i < len; i++) s += 'abc'[rnd(3)]
    const k = 1 + rnd(len)
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})
