import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = arr => buildTrace(parseInput(JSON.stringify({ arr }))).result

test('3076 example', () => {
  assert.deepEqual(solve(['cab', 'ad', 'bad', 'c']), ['ab', '', 'ba', ''])
})

test('3076 a single string has every substring uncommon', () => {
  assert.deepEqual(solve(['abc']), ['a'])
})

test('3076 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"arr":["Abd"]}'))
})

// Independent oracle: collect every substring of every other string into a set, then pick the shortest
// and alphabetically smallest substring of s outside that set.
function oracle(arr) {
  return arr.map((s, i) => {
    const seen = new Set()
    arr.forEach((o, j) => {
      if (j === i) return
      for (let x = 0; x < o.length; x++) for (let y = x + 1; y <= o.length; y++) seen.add(o.slice(x, y))
    })
    const candidates = []
    for (let x = 0; x < s.length; x++) for (let y = x + 1; y <= s.length; y++) {
      if (!seen.has(s.slice(x, y))) candidates.push(s.slice(x, y))
    }
    candidates.sort((p, q) => (p.length - q.length) || (p < q ? -1 : p > q ? 1 : 0))
    return candidates.length ? candidates[0] : ''
  })
}

test('3076 random arrays match a substring-set oracle', () => {
  let seed = 3076
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const count = 1 + rnd(5)
    const arr = []
    for (let w = 0; w < count; w++) {
      let s = ''
      const len = 1 + rnd(5)
      for (let i = 0; i < len; i++) s += 'abc'[rnd(3)]
      arr.push(s)
    }
    assert.deepEqual(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
