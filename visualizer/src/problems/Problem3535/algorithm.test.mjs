import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3535 two units and reciprocal queries', () => {
  assert.deepEqual(solve('{"n":2,"conversions":[[0,1,3]],"queries":[[0,1],[1,0]]}'), [3, 333333336])
})

test('3535 a chain with mixed factors', () => {
  assert.deepEqual(solve('{"n":4,"conversions":[[0,1,2],[1,2,3],[1,3,5]],"queries":[[2,0],[0,3],[3,2]]}'), [166666668, 10, 200000002])
})

test('3535 rejects cycles, bad factors and wrong edge counts', () => {
  assert.throws(() => parseInput('{"n":3,"conversions":[[0,1,2],[1,0,2]],"queries":[[0,1]]}'))
  assert.throws(() => parseInput('{"n":2,"conversions":[[0,1,0]],"queries":[[0,1]]}'))
  assert.throws(() => parseInput('{"n":3,"conversions":[[0,1,2]],"queries":[[0,1]]}'))
})

// Independent oracle: exact rational amounts per source unit, found by a fresh walk from each query's first unit.
function oracle(n, conversions, queries) {
  const MOD = 1000000007n
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b, f] of conversions) {
    adj[a].push([b, BigInt(f), 1n])
    adj[b].push([a, 1n, BigInt(f)])
  }
  const power = (base, e) => { let r = 1n; let b = base % MOD; while (e > 0n) { if (e & 1n) r = r * b % MOD; b = b * b % MOD; e >>= 1n } return r }
  return queries.map(([a, b]) => {
    const value = new Map([[a, [1n, 1n]]])
    const stack = [a]
    while (stack.length) {
      const u = stack.pop()
      const [p, q] = value.get(u)
      for (const [v, num, den] of adj[u]) {
        if (value.has(v)) continue
        value.set(v, [p * num, q * den])
        stack.push(v)
      }
    }
    const [p, q] = value.get(b)
    return Number(p % MOD * power(q, MOD - 2n) % MOD)
  })
}

test('3535 random trees match the walk oracle', () => {
  let seed = 3535
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(7)
    const conversions = []
    for (let v = 1; v < n; v++) conversions.push(rnd(2) ? [rnd(v), v, 1 + rnd(9)] : [v, rnd(v), 1 + rnd(9)])
    const queries = Array.from({ length: 1 + rnd(6) }, () => [rnd(n), rnd(n)])
    const text = JSON.stringify({ n, conversions, queries })
    assert.deepEqual(solve(text), oracle(n, conversions, queries), text)
  }
})

test('3535 frames keep their pseudocode and python lines in range', () => {
  const run = buildTrace(parseInput('{"n":3,"conversions":[[0,1,2],[2,1,4]],"queries":[[1,0]]}'))
  assert.ok(run.frames.length > 3)
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= 10)
    assert.ok(f.pythonLine >= 1)
    assert.equal(f.amount.length, 3)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
