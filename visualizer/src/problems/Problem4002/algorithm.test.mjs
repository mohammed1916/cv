import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, k) => buildTrace({ n, k }).result

test('4002 small hand cases', () => {
  assert.equal(solve(1, 1), 0)
  assert.equal(solve(4, 2), 1)
  assert.equal(solve(3, 3), 0)
  assert.equal(solve(6, 3), 10)
})

test('4002 rejects k outside 1..n', () => {
  assert.throws(() => parseInput('{"n":3,"k":0}'))
  assert.throws(() => parseInput('{"n":3,"k":4}'))
})

// Brute oracle: enumerate every ordered composition of n into k positive parts.
function brute(n, k) {
  let count = 0
  const rec = (left, parts, product) => {
    if (parts === 0) {
      if (left === 0 && product % 2 === 0) count++
      return
    }
    for (let v = 1; v <= left; v++) rec(left - v, parts - 1, product * v)
  }
  rec(n, k, 1)
  return count
}

test('4002 matches enumeration of compositions', () => {
  for (let n = 1; n <= 12; n++) {
    for (let k = 1; k <= n; k++) {
      assert.equal(solve(n, k), brute(n, k) % 1000000007, `n=${n} k=${k}`)
    }
  }
})

test('4002 frames reference valid pseudocode and python lines', () => {
  const run = buildTrace({ n: 6, k: 3 })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(typeof f.message, 'string')
  }
})
