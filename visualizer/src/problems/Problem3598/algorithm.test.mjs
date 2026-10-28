import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = words => buildTrace(parseInput(JSON.stringify({ words }))).result

test('3598 official examples', () => {
  assert.deepEqual(solve(['jump', 'run', 'run', 'jump', 'run']), [3, 0, 0, 3, 3])
  assert.deepEqual(solve(['dog', 'racer', 'car']), [0, 0, 0])
})

test('3598 a single word leaves no pairs', () => {
  assert.deepEqual(solve(['abc']), [0])
})

test('3598 the new pair created by a removal counts', () => {
  // Removing the middle word joins "ab" with "ac", which share the prefix "a".
  assert.deepEqual(solve(['ab', 'xx', 'ac']), [0, 1, 0])
})

test('3598 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"words":["Ab"]}'))
})

// Independent oracle: for each index, delete it, then scan the remaining adjacent pairs and take the largest shared prefix.
function oracle(words) {
  const lcp = (a, b) => {
    let i = 0
    while (i < a.length && i < b.length && a[i] === b[i]) i++
    return i
  }
  return words.map((_, r) => {
    const rest = words.filter((_, i) => i !== r)
    let best = 0
    for (let i = 0; i + 1 < rest.length; i++) best = Math.max(best, lcp(rest[i], rest[i + 1]))
    return best
  })
}

test('3598 random word lists match a delete-and-scan oracle', () => {
  let seed = 3598
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 200; trial++) {
    const m = 1 + rnd(8)
    const words = Array.from({ length: m }, () => Array.from({ length: 1 + rnd(4) }, () => 'abc'[rnd(3)]).join(''))
    assert.deepEqual(solve(words), oracle(words), JSON.stringify(words))
  }
})
