import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = input => buildTrace(input).result

// Independent oracle: each fruit is skipped, bought at full price, or bought with a coupon.
function oracle({ price, tastiness, maxAmount, maxCoupons }) {
  let best = 0
  const n = price.length
  const total = 3 ** n
  for (let code = 0; code < total; code++) {
    let x = code
    let spent = 0
    let coupons = 0
    let taste = 0
    for (let i = 0; i < n; i++) {
      const choice = x % 3
      x = Math.floor(x / 3)
      if (choice === 1) { spent += price[i]; taste += tastiness[i] }
      if (choice === 2) { spent += Math.floor(price[i] / 2); coupons++; taste += tastiness[i] }
    }
    if (spent <= maxAmount && coupons <= maxCoupons) best = Math.max(best, taste)
  }
  return best
}

test('2431 teaching examples', () => {
  const a = { price: [10, 6, 8, 4], tastiness: [5, 8, 3, 2], maxAmount: 12, maxCoupons: 2 }
  assert.equal(solve(a), oracle(a))
  const b = { price: [7, 3], tastiness: [4, 9], maxAmount: 8, maxCoupons: 0 }
  assert.equal(solve(b), 9)
})

test('2431 a coupon can make an otherwise unaffordable fruit fit', () => {
  const input = { price: [9], tastiness: [6], maxAmount: 5, maxCoupons: 1 }
  assert.equal(solve(input), 6)
  assert.equal(solve({ ...input, maxCoupons: 0 }), 0)
})

test('2431 parseInput validates the object', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"price":[1],"tastiness":[1,2],"maxAmount":3,"maxCoupons":1}'))
  assert.throws(() => parseInput('{"price":[1],"tastiness":[1],"maxAmount":3,"maxCoupons":4}'))
})

test('2431 random inputs match the subset-choice oracle', () => {
  let seed = 2431
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5)
    const input = {
      price: Array.from({ length: n }, () => 1 + rnd(12)),
      tastiness: Array.from({ length: n }, () => rnd(21)),
      maxAmount: rnd(25),
      maxCoupons: rnd(4),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})

test('2431 frame invariants hold on every trace', () => {
  const input = { price: [10, 6, 8, 4], tastiness: [5, 8, 3, 2], maxAmount: 12, maxCoupons: 2 }
  const run = buildTrace(input)
  const phases = new Set(['start', 'item', 'merge', 'done'])
  for (const f of run.frames) {
    assert.ok(phases.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= python.trim().split('\n').length)
    assert.equal(f.table.length, 3)
    assert.equal(f.table[0].length, 13)
  }
  assert.equal(run.frames.at(-1).value, run.result)
})
