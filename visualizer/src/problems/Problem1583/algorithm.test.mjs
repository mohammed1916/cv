import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python, phases } from './algorithm.js'

const solve = (n, preferences, pairs) => buildTrace({ n, preferences, pairs }).result

// Independent oracle: friend x is unhappy if some u that x ranks above x's partner prefers x to u's partner.
function oracle(n, preferences, pairs) {
  const partner = Array(n)
  for (const [a, b] of pairs) { partner[a] = b; partner[b] = a }
  const rank = (who, of) => preferences[who].indexOf(of)
  let count = 0
  for (let x = 0; x < n; x++) {
    const better = preferences[x].slice(0, rank(x, partner[x]))
    if (better.some(u => rank(u, x) < rank(u, partner[u]))) count++
  }
  return count
}

test('own samples give hand-checked counts', () => {
  assert.equal(solve(4, [[2, 1, 3], [2, 0, 3], [0, 1, 3], [0, 1, 2]], [[0, 1], [2, 3]]), 3)
  assert.equal(solve(2, [[1], [0]], [[0, 1]]), 0)
  assert.equal(solve(4, [[3, 1, 2], [0, 2, 3], [1, 0, 3], [2, 1, 0]], [[0, 3], [1, 2]]), oracle(4, [[3, 1, 2], [0, 2, 3], [1, 0, 3], [2, 1, 0]], [[0, 3], [1, 2]]))
})

test('frames expose the phase, pseudocode line, message and snapshot', () => {
  const trace = buildTrace(parseInput(JSON.stringify({ n: 2, preferences: [[1], [0]], pairs: [[0, 1]] })))
  assert.ok(trace.frames.every(f => Number.isInteger(f.activeLine) && typeof f.message === 'string' && f.snapshot))
  assert.ok(trace.frames.every(f => phases.some(p => p.id === f.phase)))
  assert.match(python, /def unhappyFriends\(n, preferences, pairs\):/)
})

test('parseInput rejects malformed input', () => {
  assert.throws(() => parseInput('[]'), /object/)
  assert.throws(() => parseInput(JSON.stringify({ n: 3, preferences: [[1, 2], [0, 2], [0, 1]], pairs: [[0, 1]] })), /even/)
  assert.throws(() => parseInput(JSON.stringify({ n: 2, preferences: [[0], [0]], pairs: [[0, 1]] })), /permutation/)
  assert.throws(() => parseInput(JSON.stringify({ n: 2, preferences: [[1], [0]], pairs: [[0, 0]] })), /Invalid pair|exactly one/)
})

test('random instances match the brute-force oracle', () => {
  let seed = 1583
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]] } return a }
  for (let t = 0; t < 200; t++) {
    const n = 2 * (1 + rnd(5))
    const preferences = Array.from({ length: n }, (_, u) => shuffle([...Array(n).keys()].filter(w => w !== u)))
    const order = shuffle([...Array(n).keys()])
    const pairs = Array.from({ length: n / 2 }, (_, k) => [order[2 * k], order[2 * k + 1]])
    assert.equal(solve(n, preferences, pairs), oracle(n, preferences, pairs))
  }
})
