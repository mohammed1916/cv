import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, isSpecial } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result
// Oracle: exhaustive search over swaps of two adjacent special substrings.
function brute(s) {
  const seen = new Set([s]); const queue = [s]
  while (queue.length) {
    const cur = queue.pop()
    for (let i = 0; i < cur.length; i++) for (let j = i + 1; j <= cur.length; j++) {
      const a = cur.slice(i, j)
      if (!isSpecial(a)) continue
      for (let k = j + 1; k <= cur.length; k++) {
        const b = cur.slice(j, k)
        if (!isSpecial(b)) continue
        const next = cur.slice(0, i) + b + a + cur.slice(k)
        if (!seen.has(next)) { seen.add(next); queue.push(next) }
      }
    }
  }
  return [...seen].sort().at(-1)
}
function randomSpecial(rnd, pairs) {
  let s = '', open = 0, left = pairs, total = pairs
  while (left > 0 || open > 0) {
    if (left > 0 && (open === 0 || rnd(2))) { s += '1'; open++; left-- } else { s += '0'; open-- }
  }
  return total ? s : ''
}
test('official examples', () => { assert.equal(solve('11011000'), '11100100'); assert.equal(solve('10'), '10') })
test('random special strings vs swap-closure brute force', () => {
  let seed = 9
  const rnd = n => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n
  for (let t = 0; t < 150; t++) {
    const s = randomSpecial(rnd, 1 + rnd(6))
    const r = solve(s)
    assert.equal(r, brute(s), s)
    assert.ok(isSpecial(r) && r.length === s.length)
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('"01"'), /special/)
  assert.throws(() => parseInput('"12"'), /0s and 1s/)
  assert.throws(() => parseInput('"' + '10'.repeat(31) + '"'), /cap/)
})
