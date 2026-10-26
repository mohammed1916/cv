import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (bottom, allowed) => buildTrace(parseInput(JSON.stringify({ bottom, allowed }))).result
// Oracle: level-by-level reachability over the set of all possible rows (no memo-on-failure, no backtracking).
function oracle(bottom, allowed) {
  const opt = new Map()
  for (const t of allowed) opt.set(t.slice(0, 2), (opt.get(t.slice(0, 2)) || '') + t[2])
  let rows = new Set([bottom])
  while (rows.size && [...rows][0].length > 1) {
    const next = new Set()
    for (const r of rows) {
      let partial = ['']
      for (let i = 0; i + 1 < r.length && partial.length; i++) partial = partial.flatMap(p => [...(opt.get(r.slice(i, i + 2)) || '')].map(c => p + c))
      partial.forEach(p => next.add(p))
    }
    rows = next
  }
  return rows.size > 0
}
test('official examples', () => {
  assert.equal(solve('BCD', ['BCC', 'CDE', 'CEA', 'FFF']), true)
  assert.equal(solve('AAAA', ['AAB', 'AAC', 'BCD', 'BBE', 'DEF']), false)
})
test('random instances vs reachability oracle', () => {
  let seed = 13
  const rnd = n => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n
  const L = 'ABCD'
  let yes = 0
  for (let t = 0; t < 500; t++) {
    const bottom = Array.from({ length: 2 + rnd(4) }, () => L[rnd(4)]).join('')
    const all = new Set(Array.from({ length: rnd(25) }, () => L[rnd(4)] + L[rnd(4)] + L[rnd(4)]))
    const allowed = [...all]
    const expected = oracle(bottom, allowed)
    if (expected) yes++
    assert.equal(solve(bottom, allowed), expected, bottom + allowed)
  }
  assert.ok(yes > 20)
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('{"bottom": "A", "allowed": []}'), /2-6/)
  assert.throws(() => parseInput('{"bottom": "AB", "allowed": ["ABG"]}'), /triples/)
  assert.throws(() => parseInput('{"bottom": "AB", "allowed": ["ABC","ABC"]}'), /unique/)
})
