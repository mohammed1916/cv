import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = queries => buildTrace(parseInput(JSON.stringify({ queries }))).result

test('3145 official examples', () => {
  assert.deepEqual(solve([[1, 3, 7]]), [4])
  assert.deepEqual(solve([[2, 5, 3], [7, 7, 4]]), [2, 2])
})

test('3145 edge cases', () => {
  assert.deepEqual(solve([[0, 0, 1000]]), [1])
  assert.deepEqual(solve([[0, 3, 1]]), [0])
})

test('3145 rejects bad triples', () => {
  assert.throws(() => parseInput('{"queries":[[3,1,5]]}'))
  assert.throws(() => parseInput('{"queries":[[0,1,0]]}'))
})

// Independent oracle: build big_nums explicitly from the powerful arrays, then multiply the slice modulo mod.
const BIG = (() => {
  const out = []
  for (let x = 1; out.length < 400; x++) {
    for (let b = 0; 2 ** b <= x; b++) if ((x >> b) & 1) out.push(BigInt(2) ** BigInt(b))
  }
  return out
})()

function oracle([from, to, mod]) {
  let product = BigInt(1) % BigInt(mod)
  for (let i = from; i <= to; i++) product = (product * BIG[i]) % BigInt(mod)
  return Number(product)
}

test('3145 random queries match an explicit product of big_nums', () => {
  let seed = 3145
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const queries = []
    const count = 1 + rnd(4)
    for (let i = 0; i < count; i++) {
      const from = rnd(300)
      const to = from + rnd(Math.min(300 - from, 90) + 1)
      queries.push([from, to, 1 + rnd(1000)])
    }
    assert.deepEqual(solve(queries), queries.map(oracle), JSON.stringify(queries))
  }
})
