import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: transitive closure of the equalities (Floyd-Warshall on 26 letters), then check each
// inequality against that closure.
function closureVerdict(equations) {
  const n = 26
  const same = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j))
  const idx = ch => ch.charCodeAt(0) - 97
  for (const eq of equations) if (eq[1] === '=') same[idx(eq[0])][idx(eq[3])] = same[idx(eq[3])][idx(eq[0])] = true
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if (same[i][k] && same[k][j]) same[i][j] = true
  }
  return equations.every(eq => eq[1] === '=' || !same[idx(eq[0])][idx(eq[3])])
}

test('990 satisfiability matches the transitive-closure oracle', () => {
  const cases = [
    ['a==b', 'b!=a'], ['b==a', 'a==b'], ['a==b', 'b==c', 'a!=c'], ['a==b', 'c!=d'],
    ['x!=y', 'y!=z', 'z!=x'], ['p==q', 'q==r', 's!=t', 't==u'], ['m!=m'], ['e==f', 'f!=g', 'g==e'],
    ['a==b', 'c==d', 'b==c', 'a!=d'], ['k==l', 'l!=m', 'm==n', 'n==k'],
  ]
  for (const equations of cases) {
    const run = buildTrace(parseInput(JSON.stringify({ equations })))
    assert.equal(run.result, closureVerdict(equations), JSON.stringify(equations))
  }
})

test('990 rejects malformed equations', () => {
  assert.throws(() => parseInput('{"equations":["a=b"]}'))
  assert.throws(() => parseInput('{"equations":["A==b"]}'))
})
