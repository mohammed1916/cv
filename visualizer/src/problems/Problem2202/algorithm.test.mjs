import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('2202 worked examples', () => {
  assert.equal(solve([5, 2, 2, 4, 0, 6], 4), 5)
  assert.equal(solve([2], 1), -1)
  assert.equal(solve([2], 2), 2)
  assert.equal(solve([9, 1, 3], 0), 9)
  assert.equal(solve([1, 7, 2], 3), 7)
})

test('2202 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":-1}'))
  assert.throws(() => parseInput('{"nums":[10],"k":1}'))
})

// Oracle: breadth-first search over every pile state reachable in exactly k moves.
function oracle(nums, k) {
  const key = (p) => JSON.stringify(p)
  let states = [{ pile: nums.slice(), removed: [] }]
  for (let step = 0; step < k; step++) {
    const next = new Map()
    for (const s of states) {
      if (s.pile.length) {
        const pile = s.pile.slice(1); const removed = [...s.removed, s.pile[0]]
        next.set(key({ pile, removed }), { pile, removed })
      }
      for (let i = 0; i < s.removed.length; i++) {
        const pile = [s.removed[i], ...s.pile]
        const removed = s.removed.filter((_, j) => j !== i)
        next.set(key({ pile, removed }), { pile, removed })
      }
    }
    states = [...next.values()]
  }
  let best = -1
  for (const s of states) if (s.pile.length) best = Math.max(best, s.pile[0])
  return best
}

test('2202 small piles match a state search', () => {
  let seed = 2202
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const nums = Array.from({ length: 1 + rnd(4) }, () => rnd(10))
    const k = rnd(5)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})

test('2202 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"nums":[5,2,2,4,0,6],"k":4}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
