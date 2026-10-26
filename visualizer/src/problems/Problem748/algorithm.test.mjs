import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (plate, words) => buildTrace(parseInput(JSON.stringify({ licensePlate: plate, words }))).result
// Oracle: remove plate letters from a mutable copy of the word.
function oracle(plate, words) {
  const letters = [...plate.toLowerCase()].filter(c => c >= 'a' && c <= 'z')
  let best = null
  for (const w of words) {
    const pool = [...w]
    const ok = letters.every(c => { const i = pool.indexOf(c); if (i < 0) return false; pool.splice(i, 1); return true })
    if (ok && (best === null || w.length < best.length)) best = w
  }
  return best
}
test('official examples', () => {
  assert.equal(solve('1s3 PSt', ['step', 'steps', 'stripe', 'stepple']), 'steps')
  assert.equal(solve('1s3 456', ['looks', 'pest', 'stew', 'show']), 'pest')
})
test('random vs oracle', () => {
  let seed = 7
  const rnd = n => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n
  const alpha = 'abc'
  for (let t = 0; t < 400; t++) {
    const plate = Array.from({ length: rnd(6) }, () => alpha[rnd(3)].toUpperCase()).join('') + '1a'
    const words = Array.from({ length: 1 + rnd(8) }, () => Array.from({ length: 1 + rnd(7) }, () => alpha[rnd(3)]).join(''))
    const expected = oracle(plate, words)
    if (expected === null) continue
    assert.equal(solve(plate, words), expected)
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('{"licensePlate": "123", "words": ["a"]}'), /letter/)
  assert.throws(() => parseInput('{"licensePlate": "a", "words": ["A"]}'), /lowercase/)
  assert.throws(() => parseInput('[]'), /Enter/)
})
