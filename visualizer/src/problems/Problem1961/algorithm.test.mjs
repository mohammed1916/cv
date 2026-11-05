import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (s, words) => buildTrace(parseInput(JSON.stringify({ s, words }))).result
const brute = (s, words) => {
  for (let k = 1; k <= words.length; k++) if (words.slice(0, k).join('') === s) return true
  return false
}

test('1961 invented examples', () => {
  assert.equal(solve('catdog', ['cat', 'dog', 'bird']), true)
  assert.equal(solve('catdo', ['cat', 'dog']), false)
  assert.equal(solve('cat', ['ca', 't']), true)
})

test('1961 matches brute force on small cases', () => {
  const pool = ['a', 'ab', 'b', 'ba', 'abb']
  for (let trial = 0; trial < 200; trial++) {
    const words = Array.from({ length: 1 + (trial % 4) }, (_, i) => pool[(trial * 7 + i * 3) % pool.length])
    const s = words.slice(0, 1 + (trial % 3)).join('') + (trial % 5 === 0 ? 'x' : '')
    const clean = s.replace(/x/g, '')
    if (!clean) continue
    assert.equal(solve(clean, words), brute(clean, words), `${clean} ${words}`)
  }
})
