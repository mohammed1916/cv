import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2657 official examples', () => {
  assert.deepEqual(solve('{"A":[1,3,2,4],"B":[3,1,2,4]}'), [0, 2, 3, 4])
  assert.deepEqual(solve('{"A":[2,3,1],"B":[3,1,2]}'), [0, 1, 3])
})

test('2657 a value at the same index in both arrays counts once', () => {
  assert.deepEqual(solve('{"A":[1,2],"B":[1,2]}'), [1, 2])
})

test('2657 rejects a repeated value', () => {
  assert.throws(() => parseInput('{"A":[1,1],"B":[1,2]}'))
})

// Independent oracle: for each prefix length, intersect the two prefixes directly.
function oracle(A, B) {
  return A.map((_, i) => A.slice(0, i + 1).filter(v => B.slice(0, i + 1).includes(v)).length)
}

test('2657 random permutations match a prefix-intersection oracle', () => {
  let seed = 2657
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = rnd(i + 1); [arr[i], arr[j]] = [arr[j], arr[i]] } return arr }
  for (let round = 0; round < 300; round++) {
    const n = 1 + rnd(10)
    const base = Array.from({ length: n }, (_, i) => i + 1)
    const A = shuffle([...base]), B = shuffle([...base])
    assert.deepEqual(solve(JSON.stringify({ A, B })), oracle(A, B), JSON.stringify({ A, B }))
  }
})
