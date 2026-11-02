import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).result

test('3106 worked examples', () => {
  assert.equal(solve('cbabc', 2), 'ababc')
  assert.equal(solve('xaxcd', 4), 'aawcd')
  assert.equal(solve('lol', 0), 'lol')
})

test('3106 edge cases', () => {
  assert.equal(solve('a', 0), 'a')
  assert.equal(solve('a', 1), 'a')
  assert.equal(solve('b', 1), 'a')
  assert.equal(solve('z', 1), 'a')
  assert.equal(solve('n', 13), 'a')
  assert.throws(() => parseInput('{"s":"AB","k":1}'))
})

// Independent oracle: try every string of the same length over the alphabet and keep the smallest
// one whose total cyclic cost fits the budget.
function oracle(s, k) {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const n = s.length
  let best = null
  const idx = Array(n).fill(0)
  for (;;) {
    let total = 0
    let cand = ''
    for (let i = 0; i < n; i++) {
      const c = letters[idx[i]]
      const d = Math.abs(c.charCodeAt(0) - s.charCodeAt(i))
      total += Math.min(d, 26 - d)
      cand += c
    }
    if (total <= k && (best === null || cand < best)) best = cand
    let p = n - 1
    while (p >= 0 && idx[p] === 25) { idx[p] = 0; p-- }
    if (p < 0) break
    idx[p]++
  }
  return best
}

test('3106 short strings match the exhaustive oracle', () => {
  let seed = 3106
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const n = 1 + rnd(3)
    const s = Array.from({ length: n }, () => 'abcdefghijklmnopqrstuvwxyz'[rnd(26)]).join('')
    const k = rnd(30)
    assert.equal(solve(s, k), oracle(s, k), JSON.stringify({ s, k }))
  }
})
