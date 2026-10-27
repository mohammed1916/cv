import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (bags, k) => buildTrace({ bags, k }).result

test('3413 official examples', () => {
  assert.equal(solve([[8, 10, 1], [1, 3, 2], [5, 6, 4]], 4), 10)
  assert.equal(solve([[1, 10, 3]], 2), 6)
})

test('3413 a window can sit in a gap and earn nothing', () => {
  assert.equal(solve([[5, 5, 9]], 1), 9)
  assert.equal(solve([[1, 1, 2], [10, 10, 1]], 3), 2)
})

test('3413 rejects overlapping bags and bad k', () => {
  assert.throws(() => parseInput('{"bags":[[1,5,1],[4,6,1]],"k":2}'), /overlap/)
  assert.throws(() => parseInput('{"bags":[[1,5,1]],"k":0}'))
})

// Independent oracle: mark every position with its coin value and try every window start.
function oracle(bags, k) {
  const coins = new Array(70).fill(0)
  for (const [l, r, c] of bags) for (let p = l; p <= r; p++) coins[p] = c
  let best = 0
  for (let s = 0; s + k - 1 < 70; s++) {
    let total = 0
    for (let p = s; p < s + k; p++) total += coins[p]
    best = Math.max(best, total)
  }
  return best
}

test('3413 random bags match a position-by-position oracle', () => {
  let seed = 3413
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const bags = []
    let pos = 1 + rnd(3)
    for (let i = 0; i < 1 + rnd(4); i++) {
      const l = pos
      const r = l + rnd(4)
      bags.push([l, r, 1 + rnd(9)])
      pos = r + 2 + rnd(4)
    }
    const k = 1 + rnd(12)
    assert.equal(solve(bags, k), oracle(bags, k), JSON.stringify({ bags, k }))
  }
})
