import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (cookies, k) => buildTrace({ cookies, k }).result

test('2305 official examples', () => {
  assert.equal(solve([8, 15, 10, 20, 8], 2), 31)
  assert.equal(solve([6, 1, 3, 2, 2, 4, 1, 2], 3), 7)
})

test('2305 one child per bag when k equals the number of bags', () => {
  assert.equal(solve([4, 9, 2], 3), 9)
})

test('2305 rejects k larger than the number of bags', () => {
  assert.throws(() => parseInput('{"cookies":[1,2],"k":3}'), /at most the number of bags/)
})

// Independent oracle: enumerate all k^n assignments of bags to children.
function oracle(cookies, k) {
  const n = cookies.length
  let best = Infinity
  const total = k ** n
  for (let code = 0; code < total; code++) {
    const totals = new Array(k).fill(0)
    let rest = code
    for (let i = 0; i < n; i++) {
      totals[rest % k] += cookies[i]
      rest = Math.floor(rest / k)
    }
    best = Math.min(best, Math.max(...totals))
  }
  return best
}

test('2305 random inputs match an exhaustive oracle', () => {
  let seed = 2305
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(5)
    const k = 2 + rnd(Math.min(3, n - 1))
    const cookies = Array.from({ length: n }, () => 1 + rnd(30))
    assert.equal(solve(cookies, k), oracle(cookies, k), JSON.stringify({ cookies, k }))
  }
})
