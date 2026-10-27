import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('1611 official examples', () => {
  assert.equal(solve(3), 2)
  assert.equal(solve(6), 4)
})

test('1611 edge cases', () => {
  assert.equal(solve(0), 0)
  assert.equal(solve(1), 1)
  assert.equal(solve(2), 3)
})

test('1611 rejects out of range input', () => {
  assert.throws(() => parseInput('{"n":-1}'))
  assert.throws(() => parseInput('{"n":1024}'))
})

// Independent oracle: breadth-first search over every state of the operations, from n to 0.
function oracle(n) {
  const bits = 10
  const dist = new Map([[n, 0]])
  const queue = [n]
  for (let head = 0; head < queue.length; head++) {
    const s = queue[head]
    if (s === 0) return dist.get(s)
    const next = []
    next.push(s ^ 1)
    for (let i = 1; i < bits; i++) {
      // Flip bit i only when bit i-1 is set and all lower bits are zero.
      if ((s >> (i - 1)) & 1 && (s & ((1 << (i - 1)) - 1)) === 0) next.push(s ^ (1 << i))
    }
    for (const t of next) {
      if (!dist.has(t)) { dist.set(t, dist.get(s) + 1); queue.push(t) }
    }
  }
  return dist.get(0)
}

test('1611 small values match a breadth-first search over states', () => {
  for (let n = 0; n < 256; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})

test('1611 seeded random values match the search', () => {
  let seed = 1611
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = rnd(1024)
    assert.equal(solve(n), oracle(n), `n=${n}`)
  }
})
