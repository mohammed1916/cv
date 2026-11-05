import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (present, future, budget) => buildTrace(parseInput(JSON.stringify({ present, future, budget }))).result

test('2291 worked examples', () => {
  assert.equal(solve([2, 3, 4], [5, 4, 9], 6), 8)
  assert.equal(solve([5], [1], 5), 0)
  assert.equal(solve([2, 2], [5, 6], 4), 7)
  assert.equal(solve([1], [9], 0), 0)
})

test('2291 rejects invalid input', () => {
  assert.throws(() => parseInput('{"present":[1],"future":[1,2],"budget":3}'))
  assert.throws(() => parseInput('{"present":[1],"future":[2],"budget":21}'))
  assert.throws(() => parseInput('{"present":[0],"future":[2],"budget":3}'))
})

// Oracle: try every subset of stocks and keep the best net profit whose total cost fits the budget.
function oracle(present, future, budget) {
  const n = present.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    let cost = 0
    let profit = 0
    for (let i = 0; i < n; i++) if (mask & (1 << i)) { cost += present[i]; profit += future[i] - present[i] }
    if (cost <= budget) best = Math.max(best, profit)
  }
  return best
}

test('2291 random inputs match a subset oracle', () => {
  let seed = 2291
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5)
    const present = Array.from({ length: n }, () => 1 + rnd(10))
    const future = Array.from({ length: n }, () => 1 + rnd(12))
    const budget = rnd(15)
    assert.equal(solve(present, future, budget), oracle(present, future, budget), JSON.stringify({ present, future, budget }))
  }
})

test('2291 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"present":[1,2,3],"future":[4,3,2],"budget":3}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
