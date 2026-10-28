import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2412 hand-checked examples', () => {
  assert.equal(solve({ transactions: [[2, 1], [5, 0], [4, 2]] }), 10)
  assert.equal(solve({ transactions: [[3, 0], [0, 3]] }), 3)
})

test('2412 the money must cover the worst order', () => {
  // Done as [10, 9] then [2, 0] needs 10, but done as [2, 0] then [10, 9] needs 12; the worst order sets the answer.
  assert.equal(solve({ transactions: [[2, 0], [10, 9]] }), 12)
})

test('2412 a single transaction needs its cost', () => {
  assert.equal(solve({ transactions: [[7, 3]] }), 7)
})

test('2412 rejects a cost of zero', () => {
  assert.throws(() => parseInput('{"transactions":[[0,0]]}'))
})

// Independent oracle: for every order, work backwards from the end to find the money needed before the first step;
// the answer must cover the worst order, so keep the largest of those.
function oracle({ transactions }) {
  const n = transactions.length
  const used = Array(n).fill(false)
  let best = 0
  const walk = (depth, order) => {
    if (depth === n) {
      let need = 0
      for (let k = n - 1; k >= 0; k--) {
        const [cost, cashback] = transactions[order[k]]
        need = Math.max(cost, need + cost - cashback)
      }
      best = Math.max(best, need)
      return
    }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue
      used[i] = true
      order.push(i)
      walk(depth + 1, order)
      order.pop()
      used[i] = false
    }
  }
  walk(0, [])
  return best
}

test('2412 random transactions match an order-enumeration oracle', () => {
  let seed = 2412
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const transactions = Array.from({ length: 1 + rnd(6) }, () => { const cost = 1 + rnd(10); return [cost, rnd(cost + 1)] })
    const input = { transactions }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
