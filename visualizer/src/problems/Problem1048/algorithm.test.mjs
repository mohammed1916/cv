import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = words => buildTrace(parseInput(JSON.stringify({ words }))).result

test('1048 official examples', () => {
  assert.equal(solve(['a', 'b', 'ba', 'bca', 'bda', 'bdca']), 4)
  assert.equal(solve(['xbc', 'pcxbcf', 'xb', 'cxbc', 'pcxbc']), 5)
})

test('1048 unrelated words give a chain of one', () => {
  assert.equal(solve(['abcd', 'dbqca']), 1)
})

test('1048 rejects an uppercase letter', () => {
  // Words are lowercase, so the regular expression rejects this before any trace is built.
  assert.throws(() => parseInput('{"words":["Ab"]}'))
})

// Independent oracle: try every subset, and keep the largest one that is a chain of single-letter insertions.
const isPredecessor = (a, b) => {
  if (b.length !== a.length + 1) return false
  for (let i = 0; i < b.length; i++) if (b.slice(0, i) + b.slice(i + 1) === a) return true
  return false
}

function oracle(words) {
  let best = 0
  for (let mask = 1; mask < 1 << words.length; mask++) {
    const chosen = words.filter((_, i) => (mask >> i) & 1).sort((a, b) => a.length - b.length)
    let chain = true
    for (let t = 0; t + 1 < chosen.length && chain; t++) chain = isPredecessor(chosen[t], chosen[t + 1])
    if (chain && chosen.length > best) best = chosen.length
  }
  return best
}

test('1048 seeded random word lists match a subset enumeration', () => {
  let seed = 1048
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const words = Array.from({ length: 1 + rnd(7) }, () => Array.from({ length: 1 + rnd(4) }, () => 'abc'[rnd(3)]).join(''))
    assert.equal(solve(words), oracle(words), JSON.stringify(words))
  }
})
