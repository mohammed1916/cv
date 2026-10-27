import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3470 small cases by hand', () => {
  assert.deepEqual(solve({ n: 1, k: 1 }), [1])
  // For n = 3 the alternating permutations are 1 2 3 and 3 2 1.
  assert.deepEqual(solve({ n: 3, k: 1 }), [1, 2, 3])
  assert.deepEqual(solve({ n: 3, k: 2 }), [3, 2, 1])
  // For n = 4 the second one in order is 1 4 3 2.
  assert.deepEqual(solve({ n: 4, k: 2 }), [1, 4, 3, 2])
})

test('3470 rejects k above the count', () => {
  // n = 2 has only 2 1 and 1 2 as alternating permutations, so k = 3 is out of range.
  assert.throws(() => parseInput('{"n":2,"k":3}'))
})

// Independent oracle: list every permutation of 1 to n in lexicographic order and keep the alternating ones.
function permutations(items) {
  if (items.length <= 1) return [items]
  const out = []
  for (const x of items) {
    for (const rest of permutations(items.filter(y => y !== x))) out.push([x, ...rest])
  }
  return out
}

test('3470 every k for n up to 6 matches a full enumeration', () => {
  for (let n = 1; n <= 6; n++) {
    const alternating = permutations(Array.from({ length: n }, (_, i) => i + 1))
      .filter(p => p.every((v, i) => i === 0 || (v % 2) !== (p[i - 1] % 2)))
    alternating.forEach((expected, index) => {
      assert.deepEqual(solve({ n, k: index + 1 }), expected, `n=${n} k=${index + 1}`)
    })
  }
})
