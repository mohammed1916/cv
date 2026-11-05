import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (tires, changeTime, numLaps) => buildTrace(parseInput(JSON.stringify({ tires, changeTime, numLaps }))).result

test('2188 worked examples', () => {
  assert.equal(solve([[2, 3], [3, 3]], 5, 4), oracle([[2, 3], [3, 3]], 5, 4))
  assert.equal(solve([[1, 3], [2, 2], [3, 3]], 3, 5), oracle([[1, 3], [2, 2], [3, 3]], 3, 5))
  assert.equal(solve([[1, 2]], 1, 1), 1)
})

test('2188 rejects invalid input', () => {
  assert.throws(() => parseInput('{"tires":[],"changeTime":1,"numLaps":1}'))
  assert.throws(() => parseInput('{"tires":[[1,1]],"changeTime":1,"numLaps":1}'))
  assert.throws(() => parseInput('{"tires":[[1,2]],"changeTime":0,"numLaps":1}'))
})

// Oracle: enumerate every split of the laps into stints, and simulate each stint with every tire directly.
function oracle(tires, changeTime, numLaps) {
  const stintCost = (len, [f, r]) => {
    let total = 0
    let t = f
    for (let k = 0; k < len; k++) { total += t; t *= r }
    return total
  }
  let best = Infinity
  const go = (remaining, sofar, stints) => {
    if (remaining === 0) { best = Math.min(best, sofar + changeTime * (stints - 1)); return }
    for (let len = 1; len <= remaining; len++) {
      let cheapest = Infinity
      for (const tire of tires) cheapest = Math.min(cheapest, stintCost(len, tire))
      go(remaining - len, sofar + cheapest, stints + 1)
    }
  }
  go(numLaps, 0, 0)
  return best
}

test('2188 random races match an enumeration of stint splits', () => {
  let seed = 2188
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const tires = Array.from({ length: 1 + rnd(3) }, () => [1 + rnd(5), 2 + rnd(2)])
    const changeTime = 1 + rnd(10)
    const numLaps = 1 + rnd(6)
    assert.equal(solve(tires, changeTime, numLaps), oracle(tires, changeTime, numLaps), JSON.stringify({ tires, changeTime, numLaps }))
  }
})

test('2188 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"tires":[[2,3],[3,3]],"changeTime":5,"numLaps":4}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
