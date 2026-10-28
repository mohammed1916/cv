import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = word => buildTrace(word).result

test('3016 official examples', () => {
  assert.equal(solve('abcde'), 5)
  assert.equal(solve('xyzxyzxyzxyz'), 12)
  assert.equal(solve('aabbccddeeffgghhiiiiii'), 24)
})

test('3016 uppercase letters are rejected', () => {
  assert.throws(() => parseInput('"Abc"'))
})

// Independent oracle: try every assignment of letters to keys, then every order of letters on each key.
function oracle(word) {
  const freq = {}
  for (const ch of word) freq[ch] = (freq[ch] || 0) + 1
  const letters = Object.keys(freq)
  const bestOrder = group => {
    let best = Infinity
    const perm = (rest, pos, cost) => {
      if (rest.length === 0) {
        best = Math.min(best, cost)
        return
      }
      rest.forEach((l, i) => perm(rest.filter((_, j) => j !== i), pos + 1, cost + freq[l] * (pos + 1)))
    }
    perm(group, 0, 0)
    return best
  }
  let best = Infinity
  const assign = Array(letters.length).fill(0)
  const go = idx => {
    if (idx === letters.length) {
      let total = 0
      for (let key = 0; key < 8; key++) total += bestOrder(letters.filter((_, i) => assign[i] === key))
      best = Math.min(best, total)
      return
    }
    for (let key = 0; key < 8; key++) {
      assign[idx] = key
      go(idx + 1)
    }
  }
  go(0)
  return best
}

test('3016 random words match the assignment oracle', () => {
  let seed = 3016
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    let word = ''
    const len = 1 + rnd(12)
    for (let i = 0; i < len; i++) word += String.fromCharCode(97 + rnd(4))
    assert.equal(solve(word), oracle(word), word)
  }
})
