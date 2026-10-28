import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

test('2370 official examples', () => {
  assert.equal(solve('acfgbd', 2), 4)
  assert.equal(solve('abcd', 3), 4)
})

test('2370 with k = 0 only repeated letters are ideal', () => {
  assert.equal(solve('aabbaa', 0), 4)
})

test('2370 rejects an uppercase letter', () => {
  assert.throws(() => parseInput('{"s":"aB","k":1}'))
})

// Independent oracle: try every subsequence of positions and keep the longest whose neighbours are within k.
function oracle(s, k) {
  let best = 0
  const n = s.length
  for (let mask = 1; mask < 1 << n; mask++) {
    const chosen = []
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) chosen.push(s.charCodeAt(i) - 97)
    let ideal = true
    for (let t = 0; t + 1 < chosen.length && ideal; t++) ideal = Math.abs(chosen[t] - chosen[t + 1]) <= k
    if (ideal && chosen.length > best) best = chosen.length
  }
  return best
}

test('2370 seeded random strings match a subsequence enumeration', () => {
  let seed = 2370
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const s = Array.from({ length: 1 + rnd(8) }, () => 'abcdef'[rnd(6)]).join('')
    const k = rnd(5)
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})
