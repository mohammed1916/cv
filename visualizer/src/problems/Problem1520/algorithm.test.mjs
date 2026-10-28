import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('1520 official example', () => {
  assert.deepEqual(solve('adefaddaccc'), ['e', 'f', 'ccc'])
})

test('1520 a single closed span is returned whole', () => {
  assert.deepEqual(solve('abab'), ['abab'])
})

test('1520 rejects uppercase input', () => {
  assert.throws(() => parseInput(JSON.stringify({ s: 'AB' })))
})

// Independent oracle: enumerate every valid substring and every non-overlapping set of them.
function valid(s, l, r) {
  const outside = s.slice(0, l) + s.slice(r + 1)
  return ![...new Set(s.slice(l, r + 1))].some(ch => outside.includes(ch))
}

function oracle(s) {
  const intervals = []
  for (let l = 0; l < s.length; l++) for (let r = l; r < s.length; r++) if (valid(s, l, r)) intervals.push([l, r])
  let best = { count: 0, len: 0 }
  const rec = (from, lastEnd, count, len) => {
    if (count > best.count || (count === best.count && len < best.len)) best = { count, len }
    for (let i = from; i < intervals.length; i++) {
      const [l, r] = intervals[i]
      if (l > lastEnd) rec(i + 1, r, count + 1, len + (r - l + 1))
    }
  }
  rec(0, -1, 0, 0)
  return { ...best, intervals }
}

test('1520 random strings match an exhaustive interval oracle', () => {
  let seed = 1520
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(10)
    let s = ''
    for (let i = 0; i < len; i++) s += 'abcd'[rnd(4)]
    const result = solve(s)
    const want = oracle(s)
    assert.equal(result.length, want.count, s)
    assert.equal(result.reduce((sum, x) => sum + x.length, 0), want.len, s)
    for (const piece of result) {
      assert.ok(want.intervals.some(([l, r]) => s.slice(l, r + 1) === piece), `${s}: ${piece} is not a valid substring`)
    }
  }
})
