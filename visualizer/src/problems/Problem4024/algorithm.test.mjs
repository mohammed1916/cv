import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (target, drones) => buildTrace({ target, drones }).result

test('4024 small hand cases', () => {
  assert.equal(solve([0, 0], [[3, 4, 6], [1, 1, 1], [-2, 0, 1]]), -1)
  assert.equal(solve([0, 0], [[3, 4, 7], [1, 1, 2]]), 1)
  assert.equal(solve([0, 0], [[2, 0, 2], [0, -2, 2]]), 0)
  assert.equal(solve([5, 5], [[5, 5, 1]]), 0)
})

test('4024 rejects bad drones', () => {
  assert.throws(() => parseInput('{"target":[0,0],"drones":[]}'))
  assert.throws(() => parseInput('{"target":[0,0],"drones":[[1,1,0]]}'))
})

// Brute oracle: sort every reachable drone by (distance, index) and take the first.
test('4024 matches a sorted-candidate oracle', () => {
  let seed = 4024
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const target = [rnd(9) - 4, rnd(9) - 4]
    const drones = Array.from({ length: 1 + rnd(6) }, () => [rnd(9) - 4, rnd(9) - 4, 1 + rnd(8)])
    const candidates = drones
      .map(([x, y, r], i) => ({ i, d: Math.abs(x - target[0]) + Math.abs(y - target[1]), r }))
      .filter(c => c.d <= c.r)
      .sort((a, b) => a.d - b.d || a.i - b.i)
    const expected = candidates.length ? candidates[0].i : -1
    assert.equal(solve(target, drones), expected, JSON.stringify({ target, drones }))
  }
})

test('4024 frames reference valid pseudocode and python lines', () => {
  const run = buildTrace({ target: [1, 2], drones: [[0, 0, 5], [4, 4, 1]] })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
})
