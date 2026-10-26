import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
const solve = s => buildTrace(parseInput(JSON.stringify(s))).result
function brute(s) {
  let sum = 0
  for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) {
    const c = {}; for (const ch of s.slice(i, j + 1)) c[ch] = (c[ch] || 0) + 1
    sum += Object.values(c).filter(v => v === 1).length
  }
  return sum
}
test('official examples', () => {
  assert.equal(solve('ABC'), 10); assert.equal(solve('ABA'), 8); assert.equal(solve('LEETCODE'), 92)
})
test('random strings match substring enumeration', () => {
  let seed = 13; const rnd = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(14) }, () => 'ABCD'[rnd(4)]).join('')
    assert.equal(solve(s), brute(s))
  }
})
test('invalid input rejected', () => {
  for (const bad of ['""', '"abc"', '"A1"', '5', 'null', JSON.stringify('A'.repeat(101))]) assert.throws(() => parseInput(bad))
})
