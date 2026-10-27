import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = words => buildTrace({ words }).result

test('3042 official examples', () => {
  assert.equal(solve(['a', 'aba', 'ababa', 'aa']), 4)
  assert.equal(solve(['pa', 'papa', 'ma', 'mama']), 2)
  assert.equal(solve(['abab', 'ab']), 0)
})

test('3042 a word pairs with itself only through a later copy', () => {
  assert.equal(solve(['aa', 'aa']), 1)
})

test('3042 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"words":["Ab"]}'))
})

// Independent oracle: compare every pair by building the prefix and suffix of the later word by slicing.
function oracle(words) {
  let total = 0
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      const w = words[j]
      const s = words[i]
      let prefixOk = true
      let suffixOk = true
      for (let k = 0; k < s.length; k++) {
        if (w[k] !== s[k]) prefixOk = false
        if (w[w.length - s.length + k] !== s[k]) suffixOk = false
      }
      if (s.length <= w.length && prefixOk && suffixOk) total++
    }
  }
  return total
}

test('3042 random word lists match a slice-based oracle', () => {
  let seed = 3042
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = () => Array.from({ length: 1 + rnd(4) }, () => 'ab'[rnd(2)]).join('')
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + rnd(6) }, word)
    assert.equal(solve(words), oracle(words), JSON.stringify(words))
  }
})
