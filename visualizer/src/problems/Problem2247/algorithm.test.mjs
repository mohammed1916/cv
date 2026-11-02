import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => {
  const input = parseInput(text)
  return buildTrace(input).result
}
const EX = { n: 4, edges: [[0, 1, 3], [1, 2, 5], [2, 3, 2], [1, 3, 7]] }

test('2247 worked examples', () => {
  assert.equal(solve(JSON.stringify({ ...EX, k: 2 })), 12)
  assert.equal(solve(JSON.stringify({ ...EX, k: 3 })), 12)
  assert.equal(solve(JSON.stringify({ ...EX, k: 4 })), -1)
  assert.equal(solve(JSON.stringify({ n: 2, edges: [[0, 1, 9]], k: 1 })), 9)
  assert.equal(solve(JSON.stringify({ n: 3, edges: [[0, 1, 4], [0, 1, 6]], k: 1 })), 6)
})

test('2247 rejects invalid input', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,0,1]],"k":1}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[0,2,1]],"k":1}'))
  assert.throws(() => parseInput('{"n":2,"edges":[],"k":-1}'))
})

// Oracle: enumerate every simple walk of exactly k highways directly from the highway list.
function oracle(n, edges, k) {
  let best = -1
  let found = false
  const used = Array(n).fill(false)
  const go = (city, count, sum) => {
    if (count === k) {
      if (!found || sum > best) best = sum
      found = true
      return
    }
    for (const [a, b, cost] of edges) {
      const other = a === city ? b : b === city ? a : -1
      if (other < 0 || used[other]) continue
      used[other] = true
      go(other, count + 1, sum + cost)
      used[other] = false
    }
  }
  for (let start = 0; start < n; start++) {
    used.fill(false)
    used[start] = true
    go(start, 0, 0)
  }
  return found ? best : -1
}

test('2247 random graphs match an exhaustive simple-trip oracle', () => {
  let seed = 2247
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const n = 2 + rnd(4)
    const edges = []
    for (let e = 0; e < rnd(7); e++) {
      const a = rnd(n)
      const b = rnd(n)
      if (a !== b) edges.push([a, b, rnd(21) - 5])
    }
    const k = rnd(n)
    const text = JSON.stringify({ n, edges, k })
    assert.equal(solve(text), oracle(n, edges, k), text)
  }
})

test('2247 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput(JSON.stringify({ ...EX, k: 2 }))).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
