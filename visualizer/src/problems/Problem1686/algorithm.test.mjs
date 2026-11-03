import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = (alice, bob) => buildTrace({ alice, bob }).result

// Exact game value: the player to move picks a stone and gains alice or bob value; the opponent moves next.
function exact(alice, bob, free, aliceTurn) {
  if (free.length === 0) return 0
  let outcome = aliceTurn ? -Infinity : Infinity
  for (const stone of free) {
    const rest = free.filter(s => s !== stone)
    const gain = aliceTurn ? alice[stone] : -bob[stone]
    const v = gain + exact(alice, bob, rest, !aliceTurn)
    outcome = aliceTurn ? Math.max(outcome, v) : Math.min(outcome, v)
  }
  return outcome
}

test('1686 sample trace gives Alice the win with totals 14 and 12', () => {
  const trace = buildTrace({ alice: [1, 5, 9, 2], bob: [4, 3, 2, 8] })
  assert.equal(trace.result, 1)
  assert.equal(trace.frames.at(-1).snapshot.aliceSum, 14)
  assert.equal(trace.frames.at(-1).snapshot.bobSum, 12)
})

test('1686 tie and Bob-win cases', () => {
  assert.equal(solve([2, 2], [2, 2]), 0)
  assert.equal(solve([1, 1, 1], [9, 9, 9]), -1)
})

test('1686 rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"alice":[1,2],"bob":[1]}'), /equal-length/)
  assert.throws(() => parseInput('{"alice":[0],"bob":[1]}'), /equal-length/)
})

test('1686 every frame carries a phase from the declared list and a line number', () => {
  const ids = new Set(phases.map(p => p.id))
  const trace = buildTrace({ alice: [3, 1, 4, 1, 5], bob: [9, 2, 6, 5, 3] })
  for (const frame of trace.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1)
    assert.ok(frame.pythonLine >= 1)
  }
})

test('1686 greedy matches exact game value on random small arrays', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(6)
    const alice = Array.from({ length: n }, () => 1 + rnd(20))
    const bob = Array.from({ length: n }, () => 1 + rnd(20))
    const value = exact(alice, bob, alice.map((_, i) => i), true)
    const expected = value > 0 ? 1 : value < 0 ? -1 : 0
    assert.equal(solve(alice, bob), expected, JSON.stringify({ alice, bob }))
  }
})
