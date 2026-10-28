import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace(parseInput(JSON.stringify({ s, k }))).result

test('3003 official examples', () => {
  assert.equal(solve('accca', 2), 3)
  assert.equal(solve('xxyz', 1), 4)
})

test('3003 a change can split a string that is otherwise one partition', () => {
  // Without a change "aaa" is one partition; changing the middle letter gives "aba", which splits into three partitions with k = 1.
  assert.equal(solve('aaa', 1), 3)
})

test('3003 rejects k of zero', () => {
  assert.throws(() => parseInput('{"s":"ab","k":0}'))
})

// Independent oracle: for every string within one change of s, cut greedily by scanning from each start.
function partitionsOf(t, k) {
  let count = 0
  let i = 0
  while (i < t.length) {
    let j = i
    const seen = new Set()
    while (j < t.length) {
      seen.add(t[j])
      if (seen.size > k) break
      j++
    }
    count++
    i = j
  }
  return count
}

function oracle(s, k) {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  let best = partitionsOf(s, k)
  for (let p = 0; p < s.length; p++) {
    for (const c of letters) {
      const candidate = s.slice(0, p) + c + s.slice(p + 1)
      best = Math.max(best, partitionsOf(candidate, k))
    }
  }
  return best
}

test('3003 seeded random strings match a prefix-scanning oracle', () => {
  let seed = 3003
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const s = Array.from({ length: 1 + rnd(7) }, () => 'abcd'[rnd(4)]).join('')
    const k = 1 + rnd(3)
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})
