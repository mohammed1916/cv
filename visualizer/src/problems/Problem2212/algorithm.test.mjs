import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const bobOf = (numArrows, aliceArrows) => buildTrace(parseInput(JSON.stringify({ numArrows, aliceArrows }))).result
const pointsOf = (bob, alice) => bob.reduce((s, a, k) => (k > 0 && a > alice[k] ? s + k : s), 0)

test('2212 worked examples', () => {
  const alice = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2]
  const bob = bobOf(4, alice)
  assert.equal(bob.reduce((a, b) => a + b, 0), 4)
  assert.equal(pointsOf(bob, alice), 26)
  assert.equal(pointsOf(bob, alice), oracle(4, alice))
})

test('2212 rejects invalid input', () => {
  assert.throws(() => parseInput('{"numArrows":2,"aliceArrows":[0,0,0,0,0,0,0,0,0,0,0,1]}'))
  assert.throws(() => parseInput('{"numArrows":1,"aliceArrows":[2,0,0,0,0,0,0,0,0,0,0,0]}'))
  assert.throws(() => parseInput('{"numArrows":1,"aliceArrows":[1]}'))
})

// Oracle: try every subset of sections Bob wins (each costs alice + 1); the leftover arrows go to section 0.
function oracle(numArrows, alice) {
  let best = 0
  for (let mask = 0; mask < 1 << 11; mask++) {
    let cost = 0; let pts = 0
    for (let k = 1; k < 12; k++) if ((mask >> (k - 1)) & 1) { cost += alice[k] + 1; pts += k }
    if (cost <= numArrows) best = Math.max(best, pts)
  }
  return best
}

test('2212 random inputs match a subset oracle and the output is valid', () => {
  let seed = 2212
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const numArrows = 1 + rnd(12)
    const alice = Array(12).fill(0)
    for (let a = 0; a < numArrows; a++) alice[rnd(12)]++
    const bob = bobOf(numArrows, alice)
    assert.equal(bob.reduce((a, b) => a + b, 0), numArrows)
    assert.equal(pointsOf(bob, alice), oracle(numArrows, alice), JSON.stringify({ numArrows, alice }))
  }
})

test('2212 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"numArrows":3,"aliceArrows":[0,0,0,0,0,0,0,0,0,0,0,3]}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
