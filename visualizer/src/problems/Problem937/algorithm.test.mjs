import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = logs => buildTrace(parseInput(JSON.stringify(logs))).result
// Oracle: insertion sort with an explicit comparison function.
function oracle(logs) {
  const isDig = l => /^[0-9]/.test(l.split(' ').slice(1).join(' '))
  const lets = logs.filter(l => !isDig(l)), digs = logs.filter(isDig)
  const less = (a, b) => {
    const [ia, ...ra] = a.split(' '), [ib, ...rb] = b.split(' ')
    const sa = ra.join(' '), sb = rb.join(' ')
    return sa !== sb ? sa < sb : ia < ib
  }
  const out = []
  for (const l of lets) { let p = out.length; while (p > 0 && less(l, out[p - 1])) p--; out.splice(p, 0, l) }
  return [...out, ...digs]
}
test('official examples', () => {
  assert.deepEqual(solve(['dig1 8 1 5 1', 'let1 art can', 'dig2 3 6', 'let2 own kit dig', 'let3 art zero']), ['let1 art can', 'let3 art zero', 'let2 own kit dig', 'dig1 8 1 5 1', 'dig2 3 6'])
  assert.deepEqual(solve(['a1 9 2 3 1', 'g1 act car', 'zo4 4 7', 'ab1 off key dog', 'a8 act zoo']), ['g1 act car', 'a8 act zoo', 'ab1 off key dog', 'a1 9 2 3 1', 'zo4 4 7'])
})
test('random logs match insertion-sort oracle', () => {
  let seed = 11; const rnd = n => Math.floor(((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * n)
  for (let t = 0; t < 300; t++) {
    const logs = Array.from({ length: 1 + rnd(8) }, (_, i) => {
      const digit = rnd(2), w = 1 + rnd(3)
      const words = Array.from({ length: w }, () => digit ? String(rnd(10)) : 'abc'[rnd(3)])
      return `id${i}${'xyz'[rnd(3)]} ${words.join(' ')}`
    })
    assert.deepEqual(solve(logs), oracle(logs), JSON.stringify(logs))
  }
})
test('rejects bad input', () => {
  for (const bad of ['[]', '["onlyid"]', '["a1 x1"]', '["a b","a c"]', '{}', '[5]']) assert.throws(() => parseInput(bad))
})
