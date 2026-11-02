import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = equations => buildTrace(parseInput(JSON.stringify({ equations }))).result

test('2307 worked examples', () => {
  assert.equal(solve([['a', 'b', 2], ['b', 'c', 3], ['a', 'c', 6]]), false)
  assert.equal(solve([['a', 'b', 2], ['b', 'c', 3], ['a', 'c', 5]]), true)
  assert.equal(solve([['a', 'a', 2]]), true)
  assert.equal(solve([['a', 'a', 1]]), false)
  assert.equal(solve([['a', 'b', 2], ['b', 'a', 2]]), true)
})

test('2307 rejects invalid equations', () => {
  assert.throws(() => parseInput('{"equations":[["A","b",2]]}'))
  assert.throws(() => parseInput('{"equations":[["a","b",0]]}'))
  assert.throws(() => parseInput('{"equations":[["a","b",2.5]]}'))
})

// Oracle: assign a BigInt rational to each variable per component by BFS, then check every equation.
function oracle(equations) {
  const adj = new Map()
  const addEdge = (x, y, num, den) => {
    if (!adj.has(x)) adj.set(x, [])
    adj.get(x).push({ to: y, num, den })
  }
  for (const [x, y, v] of equations) {
    addEdge(x, y, BigInt(v), 1n)
    addEdge(y, x, 1n, BigInt(v))
  }
  const value = new Map()
  for (const start of adj.keys()) {
    if (value.has(start)) continue
    value.set(start, { n: 1n, d: 1n })
    const queue = [start]
    while (queue.length) {
      const u = queue.shift()
      const vu = value.get(u)
      for (const { to, num, den } of adj.get(u)) {
        // value[u] / value[to] = num / den, so value[to] = value[u] * den / num
        const candidate = { n: vu.n * den, d: vu.d * num }
        if (!value.has(to)) { value.set(to, candidate); queue.push(to) }
      }
    }
  }
  for (const [x, y, v] of equations) {
    const vx = value.get(x)
    const vy = value.get(y)
    if (vx.n * vy.d !== BigInt(v) * vy.n * vx.d) return true
  }
  return false
}

test('2307 random equation sets match a BFS-potential oracle', () => {
  let seed = 2307
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  const names = ['a', 'b', 'c', 'd', 'e']
  for (let t = 0; t < 300; t++) {
    const equations = Array.from({ length: 1 + rnd(6) }, () => [names[rnd(5)], names[rnd(5)], 1 + rnd(4)])
    assert.equal(solve(equations), oracle(equations), JSON.stringify(equations))
  }
})

test('2307 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"equations":[["a","b",2],["b","c",3],["a","c",5]]}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
