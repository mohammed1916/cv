import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result

test('3138 official examples', () => {
  assert.equal(solve('abba'), 2)
  assert.equal(solve('cdef'), 4)
})

test('3138 the shortest valid length wins even when longer ones also work', () => {
  // Length 1 fails on the first letters; length 2 splits it into "ab" and "ab", which are anagrams.
  assert.equal(solve('abab'), 2)
  assert.equal(solve('aaaa'), 1)
})

test('3138 rejects characters outside a to z', () => {
  assert.throws(() => parseInput('"aB"'))
  assert.throws(() => parseInput('"a"'))
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: count letters per block with a 26-slot array instead of sorting the block.
function signature(text) {
  const slots = new Array(26).fill(0)
  for (const ch of text) slots[ch.charCodeAt(0) - 97] += 1
  return slots.join(',')
}

function oracle(s) {
  const n = s.length
  for (let k = 1; k <= n; k++) {
    if (n % k) continue
    const want = signature(s.slice(0, k))
    let good = true
    for (let i = 0; i < n && good; i += k) good = signature(s.slice(i, i + k)) === want
    if (good) return k
  }
  return n
}

test('3138 random strings match a letter-count oracle', () => {
  let seed = 3138
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const k = 1 + rnd(4)
    const base = Array.from({ length: k }, () => 'ab'[rnd(2)]).join('')
    const blocks = 1 + rnd(4)
    let s = ''
    for (let b = 0; b < blocks; b++) s += base.split('').sort(() => rnd(2) - 0.5).join('')
    if (rnd(3) === 0) s += 'ab'[rnd(2)]
    if (s.length < 2 || s.length > 16) continue
    assert.equal(solve(s), oracle(s), s)
  }
})
