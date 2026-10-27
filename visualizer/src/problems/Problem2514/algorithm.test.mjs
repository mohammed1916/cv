import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('2514 small sentences', () => {
  assert.equal(solve('ab cd'), 4)
  assert.equal(solve('aa'), 1)
  assert.equal(solve('abc'), 6)
})

test('2514 rejects malformed sentences', () => {
  assert.throws(() => parseInput('{"s":"a  b"}'))
  assert.throws(() => parseInput('{"s":"A"}'))
  assert.throws(() => parseInput('{"s":" ab"}'))
})

// Independent oracle: list every distinct rearrangement of each word as a set of strings, then multiply the set sizes.
function oracle(s) {
  let total = 1
  for (const word of s.split(' ')) {
    const perms = new Set()
    const go = (left, acc) => {
      if (left.length === 0) { perms.add(acc); return }
      left.forEach((ch, i) => go([...left.slice(0, i), ...left.slice(i + 1)], acc + ch))
    }
    go([...word], '')
    total *= perms.size
  }
  return total % 1000000007
}

test('2514 random sentences match set-of-permutations oracle', () => {
  let seed = 2514
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const words = []
    for (let w = 0; w < 1 + rnd(4); w++) {
      let word = ''
      for (let c = 0; c < 1 + rnd(5); c++) word += 'abc'[rnd(3)]
      words.push(word)
    }
    const s = words.join(' ')
    assert.equal(solve(s), oracle(s), s)
  }
})
