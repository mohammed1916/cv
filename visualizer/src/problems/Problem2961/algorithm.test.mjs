import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2961 official examples', () => {
  assert.deepEqual(solve({ variables: [[2, 3, 3, 10], [3, 3, 3, 1], [6, 1, 1, 4]], target: 2 }), [0, 2])
  assert.deepEqual(solve({ variables: [[39, 3, 1000, 1000]], target: 17 }), [])
})

test('2961 a modulus of one makes every value zero', () => {
  assert.deepEqual(solve({ variables: [[7, 7, 7, 1]], target: 0 }), [0])
})

test('2961 rejects a variable above 1000', () => {
  assert.throws(() => parseInput('{"variables":[[1,1,1,1001]],"target":10}'))
})

// Independent oracle: exact BigInt arithmetic, taking each power in full before reducing.
function oracle(variables, target) {
  const out = []
  variables.forEach(([a, b, c, m], i) => {
    const x = (BigInt(a) ** BigInt(b)) % 10n
    const y = (x ** BigInt(c)) % BigInt(m)
    if (y === BigInt(target)) out.push(i)
  })
  return out
}

test('2961 seeded random inputs match an exact-arithmetic oracle', () => {
  let seed = 2961
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const variables = Array.from({ length: 1 + rnd(6) }, () => [1 + rnd(10), 1 + rnd(10), 1 + rnd(10), 1 + rnd(10)])
    const input = { variables, target: rnd(10) }
    assert.deepEqual(solve(input), oracle(variables, input.target), JSON.stringify(input))
  }
})
