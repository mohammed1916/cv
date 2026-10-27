import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('1553 official examples', () => {
  assert.equal(solve(10), 4)
  assert.equal(solve(6), 3)
})

test('1553 small counts', () => {
  assert.equal(solve(1), 1)
  assert.equal(solve(2), 2)
  assert.equal(solve(3), 2)
})

test('1553 rejects a count outside the visualization cap', () => {
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":2001}'))
})

// Independent oracle: breadth-first search over every remaining count, with the three legal daily moves.
function oracle(n) {
  const dist = new Map([[n, 0]])
  const queue = [n]
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head]
    if (cur === 0) return dist.get(cur)
    const moves = [cur - 1]
    if (cur % 2 === 0) moves.push(cur / 2)
    if (cur % 3 === 0) moves.push(cur / 3)
    for (const next of moves) {
      if (!dist.has(next)) {
        dist.set(next, dist.get(cur) + 1)
        queue.push(next)
      }
    }
  }
  throw new Error('unreachable')
}

test('1553 every count up to 300 matches a breadth-first search', () => {
  for (let n = 1; n <= 300; n++) {
    assert.equal(solve(n), oracle(n), `n = ${n}`)
  }
})

test('1553 seeded random counts match a breadth-first search', () => {
  let seed = 1553
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(2000)
    assert.equal(solve(n), oracle(n), `n = ${n}`)
  }
})
