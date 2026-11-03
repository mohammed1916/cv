import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

// Exhaustive check: try every trade on the augmented string, plus doing nothing.
function brute(s) {
  const count1 = t => [...t].filter(ch => ch === '1').length
  const blocks = (t, ch) => {
    const out = []
    let i = 0
    while (i < t.length) {
      let j = i
      while (j < t.length && t[j] === ch) j++
      if (j > i && i > 0 && j < t.length) out.push([i, j])
      i = Math.max(j, i + 1)
    }
    return out
  }
  const t = `1${s}1`
  let best = count1(t)
  for (const [a, b] of blocks(t, '1')) {
    const u = t.slice(0, a) + '0'.repeat(b - a) + t.slice(b)
    for (const [c, d] of blocks(u, '0')) {
      const v = u.slice(0, c) + '1'.repeat(d - c) + u.slice(d)
      best = Math.max(best, count1(v))
    }
  }
  return best - 2
}

test('3499 formula matches exhaustive search for every string up to length 8', () => {
  for (let len = 1; len <= 8; len++) {
    for (let bits = 0; bits < (1 << len); bits++) {
      const s = bits.toString(2).padStart(len, '0')
      assert.equal(solve(s), brute(s), s)
    }
  }
})

test('3499 spot checks on invented strings', () => {
  assert.equal(solve('0011010'), 6)
  assert.equal(solve('111'), 3)
})

test('3499 rejects non-binary input', () => {
  assert.throws(() => parseInput('{"s":"012"}'))
  assert.throws(() => parseInput('{"s":""}'))
})
