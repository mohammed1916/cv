import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (str1, str2) => buildTrace({ str1, str2 }).result

test('3474 worked examples', () => {
  assert.equal(solve('TFT', 'ab'), 'abab')
  assert.equal(solve('TT', 'a'), 'aa')
  assert.equal(solve('TF', 'a'), 'ab')
  assert.equal(solve('TT', 'ab'), '')
})

// Independent oracle: try every word over a, b and c, keep the smallest one that satisfies every T and F.
function oracle(str1, str2) {
  const n = str1.length
  const m = str2.length
  const size = n + m - 1
  const letters = 'abc'
  const total = 3 ** size
  for (let value = 0; value < total; value++) {
    let rest = value
    const chars = []
    for (let p = 0; p < size; p++) {
      chars.push(letters[rest % 3])
      rest = Math.floor(rest / 3)
    }
    const word = chars.reverse().join('')
    let good = true
    for (let i = 0; i < n && good; i++) {
      const matches = word.slice(i, i + m) === str2
      if ((str1[i] === 'T') !== matches) good = false
    }
    if (good) return word
  }
  return ''
}

test('3474 matches the brute-force oracle on small inputs', () => {
  for (const str2 of ['a', 'ab', 'ba', 'aab']) {
    for (let mask = 0; mask < 2 ** 4; mask++) {
      const str1 = Array.from({ length: 4 }, (_, i) => (mask >> i) & 1 ? 'T' : 'F').join('')
      assert.equal(solve(str1, str2), oracle(str1, str2), `${str1} ${str2}`)
    }
  }
})

test('3474 rejects a pattern that is not T and F', () => {
  assert.throws(() => parseInput('{"str1":"TX","str2":"a"}'))
  assert.throws(() => parseInput('{"str1":"TF","str2":"A"}'))
})
