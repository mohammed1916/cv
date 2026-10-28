import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = balance => buildTrace({ balance }).result

test('3776 official examples', () => {
  assert.equal(solve([5, 1, -4]), 4)
  assert.equal(solve([1, 2, -5, 2]), 6)
  assert.equal(solve([-3, 2]), -1)
})

test('3776 edge cases: no deficit, and a single person', () => {
  assert.equal(solve([0, 3, 1]), 0)
  assert.equal(solve([7]), 0)
})

test('3776 rejects two negative balances', () => {
  assert.throws(() => parseInput('{"balance":[-1,-2,3]}'))
})

// Independent oracle: breadth-first search over balance vectors. A move sends 1 unit from a person who holds at least 1 to a circular neighbour.
function oracle(balance) {
  const n = balance.length
  const key = s => s.join(',')
  const start = [...balance]
  const done = s => s.every(v => v >= 0)
  if (done(start)) return 0
  const seen = new Set([key(start)])
  let frontier = [start]
  let steps = 0
  while (frontier.length) {
    steps++
    const next = []
    for (const s of frontier) {
      for (let i = 0; i < n; i++) {
        if (s[i] < 1) continue
        for (const j of [(i + 1) % n, (i - 1 + n) % n]) {
          const t = [...s]
          t[i]--
          t[j]++
          if (done(t)) return steps
          const k = key(t)
          if (!seen.has(k)) { seen.add(k); next.push(t) }
        }
      }
    }
    frontier = next
  }
  return -1
}

test('3776 random balances match a breadth-first search oracle', () => {
  let seed = 3776
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = rnd(5) + 1
    const balance = Array.from({ length: n }, () => rnd(7) - 2)
    const negs = balance.map((v, i) => (v < 0 ? i : -1)).filter(i => i >= 0)
    for (const i of negs.slice(1)) balance[i] = 0
    assert.equal(solve(balance), oracle(balance), JSON.stringify(balance))
  }
})
