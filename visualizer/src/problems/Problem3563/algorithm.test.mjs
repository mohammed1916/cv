import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('3563 small examples', () => {
  assert.equal(solve('abc'), 'a')
  assert.equal(solve('az'), '')
  assert.equal(solve('zb'), 'zb')
})

test('3563 a removal can unlock another', () => {
  // Removing "ab" leaves "cd", which is removed too, so nothing is kept.
  assert.equal(solve('abcd'), '')
})

test('3563 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"Ab"}'))
})

// Independent oracle: breadth-first search over every string reachable by removing a neighbouring pair.
function oracle(s) {
  const neighbours = (a, b) => {
    const d = Math.abs(a.charCodeAt(0) - b.charCodeAt(0))
    return d === 1 || d === 25
  }
  const seen = new Set([s])
  const queue = [s]
  let best = s
  while (queue.length) {
    const t = queue.pop()
    if (t < best) best = t
    for (let i = 0; i + 1 < t.length; i++) {
      if (!neighbours(t[i], t[i + 1])) continue
      const u = t.slice(0, i) + t.slice(i + 2)
      if (!seen.has(u)) { seen.add(u); queue.push(u) }
    }
  }
  return best
}

test('3563 random strings match a reachability oracle', () => {
  let seed = 3563
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const s = Array.from({ length: 1 + rnd(8) }, () => 'abcxyz'[rnd(6)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
