import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

test('1278 official examples', () => {
  assert.equal(solve('abc', 2), 1)
  assert.equal(solve('aabbc', 3), 0)
  assert.equal(solve('leetcode', 8), 0)
})

test('1278 a single part changes the mismatched pairs', () => {
  assert.equal(solve('abcd', 1), 2)
  assert.equal(solve('abca', 1), 1)
})

test('1278 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"abc","k":4}'))
  assert.throws(() => parseInput('{"s":"ABC","k":1}'))
  assert.throws(() => parseInput('{"s":"","k":1}'))
})

// Independent oracle: try every way to cut the string into k pieces and add up the changes of each piece.
function oracle(s, k) {
  const changes = t => {
    let count = 0
    for (let a = 0, b = t.length - 1; a < b; a++, b--) if (t[a] !== t[b]) count++
    return count
  }
  let best = Infinity
  const cut = (start, parts, total) => {
    if (parts === k) {
      if (start === s.length) best = Math.min(best, total)
      return
    }
    for (let end = start + 1; end <= s.length; end++) cut(end, parts + 1, total + changes(s.slice(start, end)))
  }
  cut(0, 0, 0)
  return best
}

test('1278 random strings match the cut-enumeration oracle', () => {
  let seed = 1278
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const length = 1 + rnd(8)
    const s = Array.from({ length }, () => 'abc'[rnd(3)]).join('')
    const k = 1 + rnd(length)
    assert.equal(solve(s, k), oracle(s, k), JSON.stringify({ s, k }))
  }
})
