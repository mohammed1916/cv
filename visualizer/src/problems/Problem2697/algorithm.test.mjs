import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('2697 official examples', () => {
  assert.equal(solve('egcfe'), 'efcfe')
  assert.equal(solve('abcd'), 'abba')
  assert.equal(solve('seven'), 'neven')
})

test('2697 a single letter is already a palindrome', () => {
  assert.equal(solve('z'), 'z')
})

test('2697 rejects characters outside a to z', () => {
  assert.throws(() => parseInput('{"s":"ab1"}'))
})

// Independent oracle: enumerate every palindrome of the same length over a to z, keep those with the fewest
// mismatched positions, and take the lexicographically smallest of them.
function oracle(s) {
  const n = s.length
  const half = Math.ceil(n / 2)
  let best = null
  let bestCost = Infinity
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  const total = 26 ** half
  for (let code = 0; code < total; code++) {
    const front = []
    let rest = code
    for (let k = 0; k < half; k++) { front.push(letters[rest % 26]); rest = Math.floor(rest / 26) }
    const chars = Array(n)
    for (let k = 0; k < n; k++) chars[k] = k < half ? front[k] : front[n - 1 - k]
    const candidate = chars.join('')
    let cost = 0
    for (let k = 0; k < n; k++) if (candidate[k] !== s[k]) cost++
    if (cost < bestCost || (cost === bestCost && candidate < best)) { bestCost = cost; best = candidate }
  }
  return best
}

test('2697 short random strings match an exhaustive oracle', () => {
  let seed = 2697
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const len = 1 + rnd(4)
    let s = ''
    for (let k = 0; k < len; k++) s += 'abcdz'[rnd(5)]
    assert.equal(solve(s), oracle(s), s)
  }
})
