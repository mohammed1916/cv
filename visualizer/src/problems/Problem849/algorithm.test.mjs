import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('849 worked examples', () => {
  assert.equal(buildTrace([1, 0, 0, 0, 1, 0, 0, 0, 0]).result, 4)
  assert.equal(buildTrace([0, 0, 1, 0, 0, 0]).result, 3)
  assert.equal(buildTrace([1, 0]).result, 1)
})

test('849 random rows match a direct nearest-person search', () => {
  let state = 849
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 600; t++) {
    const n = 2 + rand(10)
    const seats = Array.from({ length: n }, () => rand(3) === 0 ? 1 : 0)
    if (!seats.includes(1)) seats[rand(n)] = 1
    if (!seats.includes(0)) seats[rand(n)] = 0
    if (!seats.includes(0) || !seats.includes(1)) continue
    let best = 0
    for (let i = 0; i < n; i++) if (seats[i] === 0) best = Math.max(best, Math.min(...seats.map((v, p) => (v === 1 ? Math.abs(p - i) : Infinity))))
    assert.equal(buildTrace(seats).result, best, JSON.stringify(seats))
  }
})

test('849 rejects a row with no taken seat', () => {
  assert.throws(() => parseInput('[0,0]'))
})
