import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (words, target) => buildTrace({ words, target }).result

test('3292 official examples', () => {
  assert.equal(solve(['abc', 'aaaaa', 'bcdef'], 'aabcdabc'), 3)
  assert.equal(solve(['abababab', 'ab'], 'ababaababa'), 2)
  assert.equal(solve(['abcdef'], 'xyz'), -1)
})

test('3292 a longer word covers a target that a short word cannot', () => {
  assert.equal(solve(['abcd', 'ab'], 'abcd'), 1)
  assert.equal(solve(['ab', 'cd'], 'abcd'), 2)
})

test('3292 rejects an uppercase target', () => {
  assert.throws(() => parseInput('{"words":["a"],"target":"A"}'))
})

// Independent oracle: top-down recursion that tries every piece length at each position with startsWith.
function oracle(words, target) {
  const memo = new Map()
  const solveFrom = i => {
    if (i === target.length) return 0
    if (memo.has(i)) return memo.get(i)
    let best = Infinity
    for (let k = 1; i + k <= target.length; k++) {
      const piece = target.slice(i, i + k)
      if (words.some(w => w.startsWith(piece))) best = Math.min(best, 1 + solveFrom(i + k))
    }
    memo.set(i, best)
    return best
  }
  const r = solveFrom(0)
  return r === Infinity ? -1 : r
}

test('3292 random inputs match a top-down recursion oracle', () => {
  let seed = 3292
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const piece = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + rnd(4) }, () => piece(1 + rnd(4)))
    const target = piece(1 + rnd(8))
    assert.equal(solve(words, target), oracle(words, target), JSON.stringify({ words, target }))
  }
})
