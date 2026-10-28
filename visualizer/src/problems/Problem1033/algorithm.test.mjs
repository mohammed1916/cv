import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('1033 official examples', () => {
  assert.deepEqual(solve({ a: 1, b: 2, c: 5 }), [1, 2])
  assert.deepEqual(solve({ a: 4, b: 3, c: 2 }), [0, 0])
})

test('1033 one empty spot beside an end stone allows a single move', () => {
  assert.deepEqual(solve({ a: 1, b: 3, c: 10 }), [1, 7])
  assert.deepEqual(solve({ a: 1, b: 2, c: 4 }), [1, 1])
})

test('1033 rejects repeated positions', () => {
  assert.throws(() => parseInput(JSON.stringify({ a: 1, b: 1, c: 5 })))
})

// Independent oracle: search the game itself. An end stone may move to any empty spot strictly inside the span
// (this is the rule behind the published examples, e.g. 1, 2, 5 can finish in one move by moving 5 to 3).
// Minimum is a breadth-first search to a state with no legal move; maximum is the longest path, which is finite
// because the span strictly shrinks each move.
function moves([x, y, z]) {
  const next = []
  for (let p = x + 1; p < z; p++) if (p !== y) next.push([p, y, z].sort((s, t) => s - t))
  for (let p = x + 1; p < z; p++) if (p !== y) next.push([x, y, p].sort((s, t) => s - t))
  return next
}

function oracle({ a, b, c }) {
  const start = [a, b, c].sort((s, t) => s - t)
  const key = s => s.join(',')
  let frontier = [start]
  const seen = new Set([key(start)])
  let minimum = 0
  while (!frontier.some(s => moves(s).length === 0)) {
    const nextFrontier = []
    for (const s of frontier) {
      for (const t of moves(s)) {
        if (!seen.has(key(t))) { seen.add(key(t)); nextFrontier.push(t) }
      }
    }
    frontier = nextFrontier
    minimum++
  }
  const memo = new Map()
  const longest = s => {
    if (memo.has(key(s))) return memo.get(key(s))
    const options = moves(s)
    const value = options.length === 0 ? 0 : 1 + Math.max(...options.map(longest))
    memo.set(key(s), value)
    return value
  }
  return [minimum, longest(start)]
}

test('1033 random positions match a game-search oracle', () => {
  let seed = 1033
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const set = new Set()
    while (set.size < 3) set.add(1 + rnd(12))
    const [a, b, c] = [...set]
    const input = { a, b, c }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
