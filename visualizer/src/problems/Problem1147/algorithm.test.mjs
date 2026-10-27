import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace({ text }).result

test('1147 official examples', () => {
  assert.equal(solve('ghiabcdefhelloadamhelloabcdefghi'), 7)
  assert.equal(solve('merchant'), 1)
  assert.equal(solve('antaprezatepzapreanta'), 11)
})

test('1147 a repeated letter splits into pairs', () => {
  assert.equal(solve('aaaa'), 4)
  assert.equal(solve('aba'), 3)
})

test('1147 rejects characters outside a to z', () => {
  assert.throws(() => parseInput('{"text":"ab1"}'))
})

// Independent oracle: dynamic programming over every substring, trying every equal prefix and suffix length.
function oracle(text) {
  const memo = new Map()
  const best = (i, j) => {
    if (i >= j) return 0
    const key = i * 100 + j
    if (memo.has(key)) return memo.get(key)
    let result = 1
    for (let len = 1; 2 * len <= j - i; len++) {
      if (text.slice(i, i + len) === text.slice(j - len, j)) result = Math.max(result, 2 + best(i + len, j - len))
    }
    memo.set(key, result)
    return result
  }
  return best(0, text.length)
}

test('1147 random strings match a dynamic programming oracle', () => {
  let seed = 1147
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    let text = ''
    const len = 1 + rnd(16)
    for (let k = 0; k < len; k++) text += 'ab'[rnd(2)]
    assert.equal(solve(text), oracle(text), text)
  }
})
