import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(words) {
  // A word is needed unless it is a suffix of some other distinct word.
  const distinct = [...new Set(words)]
  let total = 0
  for (const w of distinct) if (!distinct.some(o => o !== w && o.endsWith(w))) total += w.length + 1
  return total
}

test('820 small word lists match the suffix-check definition', () => {
  let state = 820
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const word = () => Array.from({ length: 1 + rand(4) }, () => 'abc'[rand(3)]).join('')
  for (let t = 0; t < 500; t++) {
    const words = Array.from({ length: 1 + rand(6) }, word)
    assert.equal(buildTrace(words).result, brute(words), JSON.stringify(words))
  }
})

test('820 known encodings', () => {
  assert.equal(buildTrace(['time', 'me', 'bell']).result, 10)
  assert.equal(buildTrace(['a']).result, 2)
})

test('820 rejects uppercase letters', () => {
  assert.throws(() => parseInput('["A"]'))
})
