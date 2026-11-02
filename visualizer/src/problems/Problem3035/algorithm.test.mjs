import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = words => buildTrace(words).result

test('3035 worked examples', () => {
  assert.equal(solve(['abbb', 'ba', 'aa']), 3)
  assert.equal(solve(['abc', 'ab']), 2)
})

test('3035 edge cases', () => {
  assert.equal(solve(['a']), 1)
  assert.equal(solve(['ab', 'cd']), 0)
  assert.equal(solve(['ab', 'ac']), 1)
  assert.equal(solve(['aaa', 'b']), 2)
  assert.throws(() => parseInput('["ABC"]'))
})

// Independent oracle: every arrangement of the letters, cut into the word lengths, counting palindromes.
function oracle(words) {
  const letters = words.join('').split('')
  const lengths = words.map(w => w.length)
  const seen = new Set()
  let best = 0
  const perm = (rest, prefix) => {
    if (rest.length === 0) {
      const key = prefix.join('')
      if (seen.has(key)) return
      seen.add(key)
      let at = 0
      let count = 0
      for (const L of lengths) {
        const piece = prefix.slice(at, at + L).join('')
        if (piece === [...piece].reverse().join('')) count++
        at += L
      }
      best = Math.max(best, count)
      return
    }
    for (let i = 0; i < rest.length; i++) perm(rest.filter((_, j) => j !== i), [...prefix, rest[i]])
  }
  perm(letters, [])
  return best
}

test('3035 small inputs match the arrangement oracle', () => {
  let seed = 3035
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const count = 1 + rnd(3)
    const words = Array.from({ length: count }, () => Array.from({ length: 1 + rnd(3) }, () => 'ab'[rnd(2)]).join(''))
    if (words.join('').length > 7) continue
    assert.equal(solve(words), oracle(words), JSON.stringify(words))
  }
})
