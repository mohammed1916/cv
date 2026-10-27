import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = words => buildTrace({ words }).result

test('3045 official example', () => {
  assert.equal(solve(['a', 'aba', 'ababa', 'aa']), 4)
  assert.equal(solve(['pa', 'papa', 'ma', 'mama']), 2)
})

test('3045 an earlier word is found even when a longer word sits on the same path', () => {
  assert.equal(solve(['a', 'ab', 'aba']), 1)
})

test('3045 rejects an empty word', () => {
  assert.throws(() => parseInput('{"words":[""]}'))
})

// Independent oracle: compare every earlier word with every later word using startsWith and endsWith.
function oracle(words) {
  let total = 0
  for (let j = 0; j < words.length; j++) {
    for (let i = 0; i < j; i++) {
      if (words[j].startsWith(words[i]) && words[j].endsWith(words[i])) total++
    }
  }
  return total
}

test('3045 random word lists match a startsWith and endsWith oracle', () => {
  let seed = 3045
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = () => Array.from({ length: 1 + rnd(5) }, () => 'ab'[rnd(2)]).join('')
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + rnd(8) }, word)
    assert.equal(solve(words), oracle(words), JSON.stringify(words))
  }
})
