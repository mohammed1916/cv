import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('679 official examples', () => {
  assert.equal(buildTrace([4, 1, 8, 7]).result, true)
  assert.equal(buildTrace([1, 2, 1, 2]).result, false)
  assert.equal(buildTrace([8, 3, 8, 3]).result, true)
})

// Oracle: every permutation with every operator triple and each of the five bracketings of four operands.
function oracle(cards) {
  const ops = [(a, b) => a + b, (a, b) => a - b, (a, b) => a * b, (a, b) => (Math.abs(b) < 1e-9 ? NaN : a / b)]
  const perms = []
  const permute = (arr, rest = []) => { if (!arr.length) perms.push(rest); else arr.forEach((x, i) => permute(arr.filter((_, j) => j !== i), [...rest, x])) }
  permute(cards)
  for (const [a, b, c, d] of perms) for (const f of ops) for (const g of ops) for (const h of ops) {
    const shapes = [
      () => f(g(h(a, b), c), d), // ((a?b)?c)?d
      () => f(g(a, h(b, c)), d), // (a?(b?c))?d
      () => f(a, g(h(b, c), d)), // a?((b?c)?d)
      () => f(a, g(b, h(c, d))), // a?(b?(c?d))
      () => f(g(a, b), h(c, d)), // (a?b)?(c?d)
    ]
    if (shapes.some(s => Math.abs(s() - 24) < 1e-6)) return true
  }
  return false
}

test('679 random card sets match the five-bracketing oracle', () => {
  let state = 19
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 120; t++) {
    const cards = Array.from({ length: 4 }, () => 1 + rand(9))
    assert.equal(buildTrace(cards).result, oracle(cards), JSON.stringify(cards))
  }
})

test('679 rejects values outside 1–9', () => {
  assert.throws(() => parseInput('[0,1,2,3]'))
})
