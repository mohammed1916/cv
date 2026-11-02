import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = conversions => buildTrace(conversions).result

test('3528 worked examples', () => {
  assert.deepEqual(solve([[0, 1, 2], [1, 2, 3]]), [1, 2, 6])
  assert.deepEqual(solve([[0, 1, 2], [0, 2, 3], [1, 3, 4], [1, 4, 5], [2, 5, 2], [0, 6, 3], [6, 7, 4]]), [1, 2, 3, 8, 10, 6, 3, 12])
})

test('3528 a single conversion', () => {
  assert.deepEqual(solve([[0, 1, 7]]), [1, 7])
  assert.deepEqual(solve([[0, 1, 1]]), [1, 1])
})

test('3528 long chains are reduced modulo 1000000007', () => {
  const chain = Array.from({ length: 15 }, (_, i) => [i, i + 1, 10])
  const result = solve(chain)
  assert.equal(result[15], Number(10n ** 15n % 1000000007n))
})

test('3528 rejects arrows that do not form a tree from unit 0', () => {
  assert.throws(() => parseInput('[[1,2,3]]'))
  assert.throws(() => parseInput('[[0,1,2],[0,1,3]]'))
  assert.throws(() => parseInput('[[0,1,0]]'))
})

// Independent oracle: exact BigInt products found by a depth-first walk from unit 0.
function oracle(conversions) {
  const n = conversions.length + 1
  const out = Array.from({ length: n }, () => [])
  for (const [s, t, f] of conversions) out[s].push([t, BigInt(f)])
  const exact = Array(n).fill(null)
  exact[0] = 1n
  const stack = [0]
  while (stack.length) {
    const node = stack.pop()
    for (const [t, f] of out[node]) { exact[t] = exact[node] * f; stack.push(t) }
  }
  return exact.map(v => Number(v % 1000000007n))
}

test('3528 random trees match an exact BigInt oracle', () => {
  let seed = 3528
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(12)
    const conversions = []
    for (let unit = 1; unit < n; unit++) conversions.push([rnd(unit), unit, 1 + rnd(10)])
    // Shuffle the arrows so the order in the input does not matter.
    for (let i = conversions.length - 1; i > 0; i--) { const j = rnd(i + 1); [conversions[i], conversions[j]] = [conversions[j], conversions[i]] }
    assert.deepEqual(solve(conversions), oracle(conversions), JSON.stringify(conversions))
  }
})
