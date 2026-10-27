import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (m, n, introverts, extroverts) => buildTrace(parseInput(JSON.stringify({ m, n, introverts, extroverts }))).result

test('1659 official examples', () => {
  assert.equal(solve(2, 3, 1, 2), 240)
  assert.equal(solve(3, 1, 2, 1), 260)
  assert.equal(solve(2, 2, 4, 0), 240)
})

test('1659 a lone person and an empty grid', () => {
  assert.equal(solve(1, 1, 0, 0), 0)
  assert.equal(solve(1, 1, 1, 0), 120)
  assert.equal(solve(1, 1, 0, 1), 40)
})

test('1659 rejects bad input', () => {
  assert.throws(() => parseInput('{"m":0,"n":1,"introverts":0,"extroverts":0}'))
  assert.throws(() => parseInput('{"m":1,"n":1,"introverts":2,"extroverts":0}'))
})

// Independent oracle: try every placement of empty, introvert and extrovert on the grid, and score each
// placement by summing base values and the effect of every pair of neighbouring people.
function oracle(m, n, introverts, extroverts) {
  const cells = m * n
  let best = -Infinity
  const total = 3 ** cells
  for (let code = 0; code < total; code++) {
    const state = []
    let c = code
    for (let i = 0; i < cells; i++) { state.push(c % 3); c = Math.floor(c / 3) }
    const intro = state.filter(s => s === 1).length
    const extro = state.filter(s => s === 2).length
    if (intro > introverts || extro > extroverts) continue
    let score = state.reduce((sum, s) => sum + (s === 1 ? 120 : s === 2 ? 40 : 0), 0)
    for (let r = 0; r < m; r++) {
      for (let col = 0; col < n; col++) {
        const here = state[r * n + col]
        if (here === 0) continue
        const neighbours = []
        if (col + 1 < n) neighbours.push(state[r * n + col + 1])
        if (r + 1 < m) neighbours.push(state[(r + 1) * n + col])
        for (const other of neighbours) {
          if (other === 0) continue
          const effect = s => (s === 1 ? -30 : 20)
          score += effect(here) + effect(other)
        }
      }
    }
    best = Math.max(best, score)
  }
  return best
}

test('1659 small grids match the placement oracle', () => {
  let seed = 1659
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const m = 1 + rnd(3)
    const n = 1 + rnd(3)
    const introverts = rnd(m * n + 1)
    const extroverts = rnd(m * n + 1)
    assert.equal(solve(m, n, introverts, extroverts), oracle(m, n, introverts, extroverts), JSON.stringify({ m, n, introverts, extroverts }))
  }
})
