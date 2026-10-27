import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (a, b, c) => buildTrace({ a, b, c }).result

test('984 official example is valid and uses every letter', () => {
  const s = solve(2, 2, 3)
  assert.ok(!/aaa|bbb|ccc/.test(s))
  assert.equal(s.length, 7)
  assert.equal(s.split('c').length - 1, 3)
})

test('984 impossible when one letter dominates', () => {
  assert.equal(solve(0, 0, 3), '')
})

test('984 rejects negative counts', () => {
  assert.throws(() => parseInput('{"a":-1,"b":0,"c":0}'))
})

// Independent oracle: an exact feasibility search over the remaining counts and the last two letters.
function feasible(a, b, c, last, run, memo = new Map()) {
  if (a + b + c === 0) return true
  const key = `${a},${b},${c},${last},${run}`
  if (memo.has(key)) return memo.get(key)
  let ok = false
  for (const ch of ['a', 'b', 'c']) {
    const left = { a, b, c }
    if (left[ch] === 0) continue
    if (ch === last && run === 2) continue
    const next = { a, b, c, [ch]: left[ch] - 1 }
    if (feasible(next.a, next.b, next.c, ch, ch === last ? run + 1 : 1, memo)) { ok = true; break }
  }
  memo.set(key, ok)
  return ok
}

test('984 random counts: a string exists exactly when the search says so, and the string is valid', () => {
  let seed = 127
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const a = rnd(8), b = rnd(8), c = rnd(8)
    if (a + b + c === 0) continue
    const s = solve(a, b, c)
    const exists = feasible(a, b, c, '', 0)
    assert.equal(s !== '', exists, JSON.stringify({ a, b, c, s }))
    if (exists) {
      assert.ok(!/aaa|bbb|ccc/.test(s), s)
      assert.deepEqual([s.split('a').length - 1, s.split('b').length - 1, s.split('c').length - 1], [a, b, c], s)
    }
  }
})
