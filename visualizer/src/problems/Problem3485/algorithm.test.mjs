import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3485 hand-checked example', () => {
  // Removing index 0 leaves run, run, jump, run: two runs share "run" (3).
  // Removing index 1 or 2 leaves two jumps, which share "jump" (4).
  assert.deepEqual(solve({ words: ['jump', 'run', 'run', 'jump', 'run'], k: 2 }), [3, 4, 4, 3, 4])
})

test('3485 with k equal to 1 the answer is the longest remaining word', () => {
  // Removing "ab" leaves "abc" (3), removing "abc" leaves "ab" (2), removing "a" leaves "abc" (3).
  assert.deepEqual(solve({ words: ['ab', 'abc', 'a'], k: 1 }), [3, 2, 3])
})

test('3485 rejects k larger than the number of remaining words', () => {
  assert.throws(() => parseInput('{"words":["ab","ac"],"k":2}'))
})

// Independent oracle: remove each word, then try every group of k remaining words and take the longest shared prefix.
function oracle({ words, k }) {
  return words.map((_, removed) => {
    const rest = words.filter((_, j) => j !== removed)
    let best = 0
    for (let mask = 0; mask < 1 << rest.length; mask++) {
      const chosen = rest.filter((_, j) => mask & (1 << j))
      if (chosen.length !== k) continue
      let len = 0
      while (chosen.every(w => w[len] !== undefined && w[len] === chosen[0][len])) len++
      best = Math.max(best, len)
    }
    return best
  })
}

test('3485 random word lists match a group-enumeration oracle', () => {
  let seed = 3485
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(5)
    const words = Array.from({ length: n }, () => Array.from({ length: 1 + rnd(4) }, () => 'ab'[rnd(2)]).join(''))
    const input = { words, k: 1 + rnd(n - 1) }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
