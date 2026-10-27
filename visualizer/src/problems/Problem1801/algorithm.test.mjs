import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = orders => buildTrace(parseInput(JSON.stringify({ orders }))).result

// Independent oracle: keep the backlog as a plain list and scan it linearly for the best opposite order each time.
function oracle(orders) {
  let backlog = []
  for (const [price, amount, type] of orders) {
    let left = amount
    while (left > 0) {
      const opposite = backlog.filter(o => o.type !== type && (type === 0 ? o.price <= price : o.price >= price))
      if (!opposite.length) break
      const best = opposite.reduce((a, b) => (type === 0 ? (b.price < a.price ? b : a) : (b.price > a.price ? b : a)))
      const take = Math.min(left, best.amount)
      left -= take
      best.amount -= take
      if (best.amount === 0) backlog = backlog.filter(o => o !== best)
    }
    if (left > 0) backlog.push({ price, amount: left, type })
  }
  return backlog.reduce((sum, o) => sum + o.amount, 0) % 1000000007
}

test('1801 official examples', () => {
  assert.equal(solve([[10, 5, 0], [15, 2, 1], [25, 1, 1], [30, 4, 0]]), 6)
  assert.equal(solve([[7, 1000000000, 1], [15, 3, 0], [5, 999999995, 0], [5, 1, 1]]), 999999984)
})

test('1801 a single order and a full match', () => {
  assert.equal(solve([[3, 4, 1]]), 4)
  assert.equal(solve([[3, 4, 1], [3, 4, 0]]), 0)
})

test('1801 rejects bad input', () => {
  assert.throws(() => parseInput('{"orders":[[1,2]]}'))
  assert.throws(() => parseInput('{"orders":[[1,2,2]]}'))
  assert.throws(() => parseInput('{"orders":[[0,2,0]]}'))
})

test('1801 random orders match a linear-scan oracle', () => {
  let seed = 1801
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const orders = Array.from({ length: 1 + rnd(8) }, () => [1 + rnd(10), 1 + rnd(5), rnd(2)])
    assert.equal(solve(orders), oracle(orders), JSON.stringify(orders))
  }
})
