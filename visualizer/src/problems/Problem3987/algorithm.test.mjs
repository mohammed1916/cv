import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (demands, k) => buildTrace({ demands, k }).result

function checkFrames(run) {
  const lines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, 'activeLine in range')
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= lines, 'pythonLine in range')
    assert.equal(typeof f.message, 'string')
  }
}

// Closed form: with S total demand, refills needed P = max(0, ceil(S / k) - 1); cost = P(P+1)/2.
function closedForm(demands, k) {
  const S = demands.reduce((a, b) => a + BigInt(b), 0n)
  const K = BigInt(k)
  const P = S <= K ? 0n : (S + K - 1n) / K - 1n
  return Number((P * (P + 1n) / 2n) % 1000000007n)
}

test('3987 authored examples', () => {
  assert.equal(solve([3, 5, 2], 4), 3)
  assert.equal(solve([10, 1], 3), 6)
  assert.equal(solve([4], 4), 0)
})

test('3987 the initial k units are free', () => {
  assert.equal(solve([2, 2], 4), 0)
  assert.equal(solve([5], 4), 1)
})

test('3987 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"demands":[],"k":1}'))
  assert.throws(() => parseInput('{"demands":[0],"k":1}'))
  assert.throws(() => parseInput('{"demands":[1],"k":11}'))
})

test('3987 random inputs match the closed form', () => {
  let seed = 3987
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const demands = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(40))
    const k = 1 + rnd(10)
    const run = buildTrace({ demands, k })
    assert.equal(run.result, closedForm(demands, k), JSON.stringify({ demands, k }))
    checkFrames(run)
  }
})
