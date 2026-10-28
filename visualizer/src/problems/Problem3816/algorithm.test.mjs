import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('3816 official examples', () => {
  assert.equal(solve('aaccb'), 'aacb')
  assert.equal(solve('z'), 'z')
})

test('3816 edge case: a letter that appears once is never removed', () => {
  assert.equal(solve('ba'), 'ba')
})

test('3816 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"aB"}'))
})

// Independent oracle: breadth-first search over every string reachable by deleting one copy of a letter that appears at least twice.
function oracle(s) {
  const seen = new Set([s])
  const queue = [s]
  let best = s
  while (queue.length) {
    const cur = queue.shift()
    if (cur < best) best = cur
    const counts = {}
    for (const ch of cur) counts[ch] = (counts[ch] || 0) + 1
    for (let i = 0; i < cur.length; i++) {
      if (counts[cur[i]] < 2) continue
      const next = cur.slice(0, i) + cur.slice(i + 1)
      if (!seen.has(next)) { seen.add(next); queue.push(next) }
    }
  }
  return best
}

test('3816 random strings match a reachable-string oracle', () => {
  let seed = 3816
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(9) + 1
    const s = Array.from({ length: n }, () => 'abcd'[rnd(4)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
