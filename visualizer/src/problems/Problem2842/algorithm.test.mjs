import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, countMaxBeauty, parseInput } from './algorithm.js'

test('2842 worked examples', () => {
  assert.equal(countMaxBeauty('wwwtxxyy', 2), 12n)
  assert.equal(countMaxBeauty('gggeeff', 2), 12n)
  assert.equal(buildTrace({ s: 'gggeeff', k: 2 }).result, '12')
})

test('2842 too few distinct letters gives zero', () => {
  assert.equal(countMaxBeauty('aaaa', 2), 0n)
})

test('2842 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"ab","k":0}'))
  assert.throws(() => parseInput('{"s":"AB","k":1}'))
})

// Brute force: try every index subset with k distinct letters on short strings.
function brute(s, k) {
  let best = -1, count = 0n
  const n = s.length
  for (let mask = 0; mask < 1 << n; mask++) {
    const idx = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) idx.push(i)
    if (idx.length !== k) continue
    const letters = new Set(idx.map(i => s[i]))
    if (letters.size !== k) continue
    const freq = {}
    for (const c of s) freq[c] = (freq[c] || 0) + 1
    const beauty = [...letters].reduce((sum, c) => sum + freq[c], 0)
    if (beauty > best) { best = beauty; count = 1n }
    else if (beauty === best) count += 1n
  }
  return count % 1000000007n
}

test('2842 agrees with brute force on small strings', () => {
  const samples = ['abcabc', 'aabbccd', 'zzzyx', 'abacaba', 'mnopqmm', 'xxyyzz']
  for (const s of samples) for (let k = 1; k <= 4; k++) {
    assert.equal(countMaxBeauty(s, k), brute(s, k), `${s} k=${k}`)
  }
})
