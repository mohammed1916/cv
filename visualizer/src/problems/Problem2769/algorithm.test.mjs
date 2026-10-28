import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (num, t) => buildTrace(parseInput(JSON.stringify({ num, t }))).result

test('2769 official examples', () => {
  assert.equal(solve(4, 1), 6)
  assert.equal(solve(3, 2), 7)
})

test('2769 edge cases and validation', () => {
  assert.equal(solve(1, 1), 3)
  assert.throws(() => parseInput('{"num":0,"t":1}'))
  assert.throws(() => parseInput('{"num":1,"t":51}'))
})

// Independent oracle: the net change of x minus num is a sum of up to t steps from {-2, 0, 2};
// the largest reachable x is num plus the largest reachable sum.
function oracle(num, t) {
  let reachable = new Set([0])
  const all = new Set([0])
  for (let k = 1; k <= t; k++) {
    const next = new Set()
    for (const s of reachable) for (const d of [-2, 0, 2]) next.add(s + d)
    reachable = next
    for (const s of next) all.add(s)
  }
  return num + Math.max(...all)
}

test('2769 seeded random cases match a reachable-sum oracle', () => {
  let seed = 2769
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let i = 0; i < 300; i++) {
    const num = 1 + rnd(50)
    const t = 1 + rnd(50)
    assert.equal(solve(num, t), oracle(num, t), `${num} ${t}`)
  }
})
