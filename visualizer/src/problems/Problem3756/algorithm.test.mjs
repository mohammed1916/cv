import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, queries) => buildTrace({ s, queries }).result

test('3756 worked examples', () => {
  assert.deepEqual(solve('3014', [[0, 3], [1, 1]]), [2512, 0])
  assert.deepEqual(solve('907060', [[0, 5], [2, 4]]), [21472, 988])
})

test('3756 rejects bad digits or query bounds', () => {
  assert.throws(() => parseInput('{"s":"12a","queries":[[0,1]]}'))
  assert.throws(() => parseInput('{"s":"12","queries":[[1,2]]}'))
  assert.throws(() => parseInput('{"s":"12","queries":[[1,0]]}'))
})

// Oracle: collect the nonzero digits of each window directly with big integers.
function oracle(s, queries) {
  const MOD = 1000000007n
  return queries.map(([l, r]) => {
    const part = s.slice(l, r + 1).split('').filter(c => c !== '0')
    const x = part.length ? BigInt(part.join('')) : 0n
    const total = part.reduce((acc, c) => acc + Number(c), 0)
    return Number(x * BigInt(total) % MOD)
  })
}

test('3756 random inputs match the direct oracle', () => {
  let seed = 3756
  const next = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  for (let t = 0; t < 200; t++) {
    const len = 1 + Math.floor(next() * 14)
    let s = ''
    for (let i = 0; i < len; i++) s += String(Math.floor(next() * 10))
    const queries = []
    for (let q = 0; q < 5; q++) {
      const l = Math.floor(next() * len)
      const r = l + Math.floor(next() * (len - l))
      queries.push([l, r])
    }
    assert.deepEqual(solve(s, queries), oracle(s, queries), s)
  }
})
