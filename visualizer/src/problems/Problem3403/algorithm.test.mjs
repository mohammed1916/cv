import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (word, numFriends) => buildTrace(parseInput(JSON.stringify({ word, numFriends }))).result

test('3403 examples', () => {
  assert.equal(solve('dbca', 2), 'dbc')
  assert.equal(solve('gggg', 4), 'g')
})

test('3403 one friend gets the whole word', () => {
  assert.equal(solve('abz', 1), 'abz')
})

test('3403 rejects a friend count larger than the word', () => {
  assert.throws(() => parseInput('{"word":"ab","numFriends":3}'))
  assert.throws(() => parseInput('{"word":"ab","numFriends":0}'))
})

// Independent oracle: try every way to cut the word into numFriends non-empty parts and take the largest part.
function oracle(word, k) {
  const n = word.length
  let best = ''
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    let cuts = 0
    for (let b = 0; b < n - 1; b++) if (mask & (1 << b)) cuts++
    if (cuts !== k - 1) continue
    let start = 0
    for (let b = 0; b < n; b++) {
      if (b === n - 1 || (mask & (1 << b))) {
        const part = word.slice(start, b + 1)
        if (part > best) best = part
        start = b + 1
      }
    }
  }
  return best
}

test('3403 random words match a brute-force split oracle', () => {
  let seed = 3403
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(8)
    let word = ''
    for (let i = 0; i < len; i++) word += 'abc'[rnd(3)]
    const k = 1 + rnd(len)
    assert.equal(solve(word, k), oracle(word, k), `${word} ${k}`)
  }
})
