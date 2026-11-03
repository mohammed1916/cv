import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = words => buildTrace(parseInput(JSON.stringify(words))).result

test('1554 worked presets', () => {
  assert.equal(solve(['abcd', 'abce', 'axyz']), true)
  assert.equal(solve(['aaa', 'bbb', 'abc', 'cab']), false)
  assert.equal(solve(['hello', 'world', 'hellp', 'pearl']), true)
})

test('1554 rejects bad input', () => {
  assert.throws(() => parseInput('["ab","abc"]'))
  assert.throws(() => parseInput('["ab","ab"]'))
  assert.throws(() => parseInput('["aB","ab"]'))
})

function oracle(words) {
  for (let a = 0; a < words.length; a++) {
    for (let b = a + 1; b < words.length; b++) {
      let diff = 0
      for (let j = 0; j < words[a].length; j++) if (words[a][j] !== words[b][j]) diff++
      if (diff === 1) return true
    }
  }
  return false
}

test('1554 random distinct word lists match the pairwise oracle', () => {
  let seed = 1554
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 2 + rnd(4)
    const count = 2 + rnd(6)
    const set = new Set()
    while (set.size < count) set.add(Array.from({ length: len }, () => 'abc'[rnd(3)]).join(''))
    const words = [...set]
    assert.equal(solve(words), oracle(words), JSON.stringify(words))
  }
})
