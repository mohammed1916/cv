import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3472 official examples', () => {
  assert.equal(solve('{"s":"abced","k":2}'), 3)
  assert.equal(solve('{"s":"aaazzz","k":4}'), 6)
})

test('3472 rejects a budget outside 0 to 30', () => {
  assert.throws(() => parseInput('{"s":"ab","k":31}'))
})

// Independent oracle: try every subsequence, price its mirrored pairs by cyclic distance, and keep the longest affordable one.
function oracle({ s, k }) {
  const cyc = (a, b) => { const d = Math.abs(a.charCodeAt(0) - b.charCodeAt(0)); return Math.min(d, 26 - d) }
  let best = 0
  for (let mask = 1; mask < 1 << s.length; mask++) {
    const pos = [...s.split('').keys()].filter(p => mask & (1 << p))
    const L = pos.length
    let cost = 0
    for (let t = 0; t < Math.floor(L / 2); t++) cost += cyc(s[pos[t]], s[pos[L - 1 - t]])
    if (cost <= k) {
      // A chosen subsequence can be made a palindrome for this cost; its length counts toward the answer.
      if (L > best) best = L
    }
  }
  return best
}

test('3472 seeded random cases match a subset oracle', () => {
  let seed = 3472
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(8)
    let s = ''
    for (let i = 0; i < len; i++) s += 'aegmtz'[rnd(6)]
    const k = rnd(12)
    const input = { s, k }
    assert.equal(solve(JSON.stringify(input)), oracle(input), JSON.stringify(input))
  }
})
