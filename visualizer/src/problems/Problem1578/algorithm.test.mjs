import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (colors, neededTime) => buildTrace({ colors, neededTime }).result

function brute(colors, t) {
  let best = Infinity
  for (let mask = 0; mask < 1 << colors.length; mask++) {
    let cost = 0, last = null, ok = true
    for (let k = 0; k < colors.length; k++) {
      const kept = (mask >> k) & 1
      if (!kept) { cost += t[k]; continue }
      if (last !== null && colors[last] === colors[k]) { ok = false; break }
      last = k
    }
    if (ok) best = Math.min(best, cost)
  }
  return best
}

test('own samples give the expected costs', () => {
  assert.equal(solve('aabaa', [1, 2, 3, 4, 1]), 2)
  assert.equal(solve('cccca', [5, 1, 7, 2, 3]), 8)
  assert.equal(solve('abcd', [4, 3, 2, 1]), 0)
})

test('frames carry a phase, a pseudocode line, a message and a snapshot', () => {
  const trace = buildTrace(parseInput('{"colors":"aab","neededTime":[1,2,3]}'))
  for (const f of trace.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1)
    assert.ok(f.snapshot && typeof f.snapshot === 'object')
  }
  assert.match(python, /def minCost\(colors, neededTime\):/)
})

test('parseInput rejects bad input', () => {
  assert.throws(() => parseInput('{"colors":"ab","neededTime":[1]}'), /one per letter/)
  assert.throws(() => parseInput('{"colors":"A","neededTime":[1]}'), /lowercase/)
})

test('small random cases match an exhaustive oracle', () => {
  let seed = 1578
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const len = 1 + rnd(8)
    const colors = Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
    const times = Array.from({ length: len }, () => 1 + rnd(9))
    assert.equal(solve(colors, times), brute(colors, times))
  }
})
