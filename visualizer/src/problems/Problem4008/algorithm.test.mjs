import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (strengths, boosts) => buildTrace({ strengths, boosts }).result

test('4008 small hand cases', () => {
  assert.equal(solve([1], []), 1)
  assert.equal(solve([5], [[0, 0, 5]]), 0)
  assert.equal(solve([3, 1], []), 4)
  assert.equal(solve([3, 1], [[1, 1, 2]]), 3)
})

test('4008 rejects an invalid boost range', () => {
  assert.throws(() => parseInput('{"strengths":[1,2],"boosts":[[1,2,3]]}'))
  assert.throws(() => parseInput('{"strengths":[1,2],"boosts":[[0,0,0]]}'))
})

// Brute oracle: try every initial strength from zero upward with a direct simulation.
function brute(strengths, boosts) {
  for (let s = 0; ; s++) {
    let cur = s
    let ok = true
    for (let i = 0; i < strengths.length && ok; i++) {
      let bonus = 0
      for (const [l, r, v] of boosts) if (i >= l && i <= r) bonus += v
      if (cur + bonus >= strengths[i]) cur = Math.max(0, cur - strengths[i])
      else ok = false
    }
    if (ok) return s
  }
}

test('4008 matches a linear scan on random inputs', () => {
  let seed = 4008
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const strengths = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(12))
    const boosts = Array.from({ length: rnd(4) }, () => {
      const l = rnd(strengths.length)
      return [l, l + rnd(strengths.length - l), 1 + rnd(8)]
    })
    assert.equal(solve(strengths, boosts), brute(strengths, boosts), JSON.stringify({ strengths, boosts }))
  }
})

test('4008 frames reference valid pseudocode and python lines', () => {
  const run = buildTrace({ strengths: [4, 2, 6], boosts: [[0, 1, 3]] })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.ok(f.low <= f.high)
  }
})
