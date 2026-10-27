import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('2507 statement examples', () => {
  assert.equal(solve(15), 5)
  assert.equal(solve(3), 3)
})

test('2507 rejects n below two', () => {
  assert.throws(() => parseInput('{"n":1}'))
})

// Independent oracle: precompute the smallest prime factor of every number with a sieve, then iterate.
const SPF = (() => {
  const spf = Array(1001).fill(0)
  for (let i = 2; i <= 1000; i++) {
    if (spf[i] === 0) for (let j = i; j <= 1000; j += i) if (spf[j] === 0) spf[j] = i
  }
  return spf
})()

function oracle(n) {
  let current = n
  for (;;) {
    let s = 0
    for (let v = current; v > 1; v /= SPF[v]) s += SPF[v]
    if (s === current) return current
    current = s
  }
}

test('2507 every n from 2 to 1000 matches a sieve oracle', () => {
  for (let n = 2; n <= 1000; n++) assert.equal(solve(n), oracle(n), `n=${n}`)
})
