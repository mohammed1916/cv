import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = words => buildTrace(parseInput(JSON.stringify(words))).result

test('2744 official examples', () => {
  assert.equal(solve(['cd', 'ac', 'dc', 'ca', 'zz']), 2)
  assert.equal(solve(['ab', 'ba', 'cc']), 1)
  assert.equal(solve(['aa', 'ab']), 0)
})

test('2744 edge case: a palindrome never pairs with a different word', () => {
  assert.equal(solve(['aa']), 0)
  assert.equal(solve(['aa', 'bb', 'ab', 'ba']), 1)
})

test('2744 rejects duplicates and words that are not two letters', () => {
  assert.throws(() => parseInput('["ab","ab"]'))
  assert.throws(() => parseInput('["abc"]'))
})

// Independent oracle: compare every pair of positions with a reversed-string check.
function oracle(words) {
  let count = 0
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      if (words[j] === [...words[i]].reverse().join('')) count += 1
    }
  }
  return count
}

test('2744 random word lists match an all-pairs oracle', () => {
  let seed = 2744
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const all = ['aa', 'ab', 'ac', 'ba', 'bb', 'bc', 'ca', 'cb', 'cc']
  for (let t = 0; t < 300; t++) {
    const pool = [...all]
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const words = pool.slice(0, 1 + rnd(all.length))
    assert.equal(solve(words), oracle(words), JSON.stringify(words))
  }
})
