import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (equations, values) => buildTrace({ equations, values }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (e, v) => execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(check_contradictions(${JSON.stringify(e)}, ${JSON.stringify(v)}))`]).toString().trim() === 'True'

// Independent oracle: BFS per component assigns a value to each name and checks every edge.
function oracle(equations, values) {
  const adj = new Map()
  const add = (u, w, r) => { if (!adj.has(u)) adj.set(u, []); adj.get(u).push([w, r]) }
  equations.forEach(([a, b], i) => { add(a, b, 1 / values[i]); add(b, a, values[i]) })
  const val = new Map()
  for (const start of adj.keys()) {
    if (val.has(start)) continue
    val.set(start, 1)
    const queue = [start]
    for (let h = 0; h < queue.length; h++) {
      const u = queue[h]
      for (const [w, r] of adj.get(u)) {
        if (!val.has(w)) { val.set(w, val.get(u) * r); queue.push(w) }
      }
    }
  }
  return equations.some(([a, b], i) => Math.abs(val.get(a) / val.get(b) - values[i]) >= 1e-5)
}

test('2307 worked examples', () => {
  assert.equal(solve([['a', 'b'], ['b', 'c'], ['a', 'c']], [2, 3, 6]), false)
  assert.equal(solve([['a', 'b'], ['b', 'c'], ['a', 'c']], [2, 3, 5]), true)
  assert.equal(solve([['x', 'x']], [2]), true)
})

test('2307 decimal values are compared with a tolerance', () => {
  assert.equal(solve([['a', 'b'], ['b', 'c'], ['a', 'c']], [0.5, 4, 2]), false)
})

test('2307 frames point at real python lines', () => {
  for (const f of buildTrace({ equations: [['a', 'b'], ['b', 'a']], values: [2, 2] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2307 rejects bad input', () => {
  assert.throws(() => parseInput('{"equations":[["a","b"]],"values":[0]}'))
  assert.throws(() => parseInput('{"equations":[["a","b"]],"values":[1.005]}'))
  assert.throws(() => parseInput('{"equations":[["a","b"]],"values":[1,2]}'))
})

test('2307 random equations match a BFS oracle and the python mirror', () => {
  let seed = 2307
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  const names = ['a', 'b', 'c', 'd']
  for (let t = 0; t < 150; t++) {
    const equations = Array.from({ length: 1 + rnd(5) }, () => [names[rnd(4)], names[rnd(4)]])
    const values = equations.map(() => [1, 2, 4, 0.5][rnd(4)])
    assert.equal(solve(equations, values), oracle(equations, values), JSON.stringify({ equations, values }))
    if (t < 8) assert.equal(runPy(equations, values), oracle(equations, values))
  }
})
