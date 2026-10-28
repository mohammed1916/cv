import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code } from './algorithm.js'

const MOD = 1000000007n
const withLetter = (letter, value) => Array.from({ length: 26 }, (_, i) => (i === letter ? value : 1))
const solve = (s, t, nums) => buildTrace(parseInput(JSON.stringify({ s, t, nums }))).result

test('3337 hand checked cases', () => {
  const zTwo = withLetter(25, 2)
  assert.equal(solve('abcyy', 2, zTwo), 7)
  assert.equal(solve('azbk', 1, zTwo), 5)
  assert.equal(solve('abcyy', 5, withLetter(0, 1)), 5)
  assert.equal(solve('a', 1, withLetter(0, 2)), 2)
  assert.equal(solve('z', 1, withLetter(25, 3)), 3)
  assert.equal(solve('z', 2, withLetter(25, 3)), 3)
  assert.equal(solve('abc', 0, zTwo), 3)
})

test('3337 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":"ABC","t":1,"nums":[1]}'))
  assert.throws(() => parseInput(JSON.stringify({ s: 'a', t: 1001, nums: withLetter(0, 1) })))
  assert.throws(() => parseInput(JSON.stringify({ s: 'a', t: 1, nums: Array(25).fill(1) })))
  assert.throws(() => parseInput(JSON.stringify({ s: 'a', t: 1, nums: withLetter(3, 0) })))
})

test('3337 every frame points at a real pseudocode line', () => {
  for (const frame of buildTrace(parseInput(JSON.stringify({ s: 'abcyy', t: 5, nums: withLetter(25, 2) }))).frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
})

// Independent oracle 1: build the transformed string itself (only viable for a few rounds).
function oracleString(s, t, nums) {
  let text = s
  for (let round = 0; round < t; round++) {
    text = [...text].map(ch => {
      const c = ch.charCodeAt(0) - 97
      let out = ''
      for (let step = 1; step <= nums[c]; step++) out += String.fromCharCode(97 + ((c + step) % 26))
      return out
    }).join('')
  }
  return text.length % 1000000007
}

// Independent oracle 2: advance the 26 letter counts one round at a time, with no matrix power.
function oracleCounts(s, t, nums) {
  let counts = Array(26).fill(0n)
  for (const ch of s) counts[ch.charCodeAt(0) - 97] += 1n
  for (let round = 0; round < t; round++) {
    const next = Array(26).fill(0n)
    for (let c = 0; c < 26; c++) {
      for (let step = 1; step <= nums[c]; step++) {
        const target = (c + step) % 26
        next[target] = (next[target] + counts[c]) % MOD
      }
    }
    counts = next
  }
  return Number(counts.reduce((total, value) => (total + value) % MOD, 0n))
}

test('3337 small rounds match the string-building oracle', () => {
  let seed = 3337
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let k = 0; k < 60; k++) {
    const nums = Array.from({ length: 26 }, () => 1 + rnd(25))
    const length = 1 + rnd(5)
    let s = ''
    for (let i = 0; i < length; i++) s += String.fromCharCode(97 + rnd(26))
    const t = rnd(4)
    assert.equal(solve(s, t, nums), oracleString(s, t, nums), `${s} ${t} ${nums}`)
  }
})

test('3337 random long runs match the per-round count oracle', () => {
  let seed = 33370
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let k = 0; k < 150; k++) {
    const nums = Array.from({ length: 26 }, () => 1 + rnd(25))
    const length = 1 + rnd(6)
    let s = ''
    for (let i = 0; i < length; i++) s += String.fromCharCode(97 + rnd(26))
    const t = rnd(301)
    assert.equal(solve(s, t, nums), oracleCounts(s, t, nums), `${s} ${t} ${nums}`)
  }
})
