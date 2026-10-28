import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (a, b, c) => buildTrace(parseInput(JSON.stringify({ a, b, c }))).result

test('2800 examples', () => {
  assert.equal(solve('abc', 'bca', 'aaa'), 'aaabca')
  assert.equal(solve('ab', 'ba', 'aba'), 'aba')
})

test('2800 one string already contains the others', () => {
  assert.equal(solve('abcd', 'bc', 'cd'), 'abcd')
})

test('2800 rejects an empty string', () => {
  assert.throws(() => parseInput('{"a":"","b":"a","c":"b"}'))
})

// Independent oracle: enumerate candidate strings over the letters used, shortest length first, in alphabetical order.
function* stringsOfLength(alphabet, len) {
  if (len === 0) {
    yield ''
    return
  }
  for (const ch of alphabet) for (const rest of stringsOfLength(alphabet, len - 1)) yield ch + rest
}

function oracle(a, b, c) {
  const alphabet = [...new Set(a + b + c)].sort()
  const need = [a, b, c]
  for (let len = Math.max(a.length, b.length, c.length); len <= a.length + b.length + c.length; len++) {
    for (const t of stringsOfLength(alphabet, len)) {
      if (need.every(w => t.includes(w))) return t
    }
  }
  return null
}

test('2800 random inputs match an exhaustive oracle', () => {
  let seed = 2800
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const word = () => {
      let w = ''
      const len = 1 + rnd(4)
      for (let i = 0; i < len; i++) w += 'ab'[rnd(2)]
      return w
    }
    const a = word()
    const b = word()
    const c = word()
    assert.equal(solve(a, b, c), oracle(a, b, c), `${a} ${b} ${c}`)
  }
})
