import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = tiles => buildTrace({ tiles }).result

test('1079 official examples', () => {
  assert.equal(solve('AAB'), 8)
  assert.equal(solve('AAABBC'), 188)
  assert.equal(solve('V'), 1)
})

test('1079 rejects lowercase letters', () => {
  assert.throws(() => parseInput('{"tiles":"ab"}'), /uppercase/)
})

const fact = n => (n <= 1 ? 1 : n * fact(n - 1))

// Independent oracle: every subset of tiles gives a multiset; each distinct multiset contributes
// its number of distinct arrangements, k! divided by the factorial of each letter count.
function oracle(tiles) {
  const n = tiles.length
  const multisets = new Set()
  for (let mask = 1; mask < 1 << n; mask++) {
    const chars = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) chars.push(tiles[i])
    multisets.add(chars.sort().join(''))
  }
  let total = 0
  for (const key of multisets) {
    const freq = {}
    for (const ch of key) freq[ch] = (freq[ch] || 0) + 1
    let arrangements = fact(key.length)
    for (const c of Object.values(freq)) arrangements /= fact(c)
    total += arrangements
  }
  return total
}

test('1079 random tiles match a multiset-arrangement oracle', () => {
  let seed = 1079
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    let tiles = ''
    for (let i = 0; i < 1 + rnd(6); i++) tiles += 'ABC'[rnd(3)]
    assert.equal(solve(tiles), oracle(tiles), tiles)
  }
})
