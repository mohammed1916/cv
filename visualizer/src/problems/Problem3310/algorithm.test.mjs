import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, k, invocations) => buildTrace({ n, k, invocations }).result

test('3310 official examples', () => {
  assert.deepEqual(solve(4, 1, [[1, 2], [0, 1], [3, 2]]), [0, 1, 2, 3])
  assert.deepEqual(solve(5, 0, [[1, 2], [0, 2], [0, 1], [3, 4]]), [3, 4])
})

test('3310 a method with no invocations can be removed alone', () => {
  assert.deepEqual(solve(1, 0, []), [])
  assert.deepEqual(solve(3, 2, [[0, 1]]), [0, 1])
})

test('3310 rejects an invocation that names a missing method', () => {
  assert.throws(() => parseInput('{"n":2,"k":0,"invocations":[[0,5]]}'))
})

// Independent oracle: transitive closure by repeated relaxation (Warshall), then the same rule.
function oracle(n, k, invocations) {
  const reach = Array.from({ length: n }, () => Array.from({ length: n }, () => false))
  for (const [a, b] of invocations) reach[a][b] = true
  for (let via = 0; via < n; via++) {
    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        if (reach[a][via] && reach[via][b]) reach[a][b] = true
      }
    }
  }
  const suspicious = Array.from({ length: n }, (_, j) => j === k || reach[k][j])
  const blocked = invocations.some(([a, b]) => !suspicious[a] && suspicious[b])
  if (blocked) return Array.from({ length: n }, (_, i) => i)
  return Array.from({ length: n }, (_, i) => i).filter(i => !suspicious[i])
}

test('3310 random projects match a transitive-closure oracle', () => {
  let seed = 3310
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const k = rnd(n)
    const invocations = Array.from({ length: rnd(10) }, () => [rnd(n), rnd(n)])
    assert.deepEqual(solve(n, k, invocations), oracle(n, k, invocations), JSON.stringify({ n, k, invocations }))
  }
})
