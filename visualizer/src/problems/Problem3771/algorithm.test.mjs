import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (hp, damage, requirement) => buildTrace({ hp, damage, requirement }).result

test('3771 hand-checked small cases', () => {
  assert.equal(solve(10, [2, 3, 4], [5, 4, 1]), 6)
  assert.equal(solve(3, [5], [1]), 0)
  assert.equal(solve(5, [1], [4]), 1)
})

// Independent oracle: prefix sums of damage, testing each (start, room) pair by formula.
function oracle(hp, damage, requirement) {
  const n = damage.length
  const prefix = [0]
  for (const d of damage) prefix.push(prefix[prefix.length - 1] + d)
  let total = 0
  for (let j = 0; j < n; j++) {
    for (let k = j; k < n; k++) {
      const remaining = hp - (prefix[k + 1] - prefix[j])
      if (remaining >= requirement[k]) total++
    }
  }
  return total
}

test('3771 matches the prefix-sum oracle on generated inputs', () => {
  let seed = 7
  const next = m => { seed = (seed * 1103515245 + 12345) % 2147483648; return 1 + (seed % m) }
  for (let t = 0; t < 300; t++) {
    const n = next(8)
    const damage = Array.from({ length: n }, () => next(12))
    const requirement = Array.from({ length: n }, () => next(12))
    const hp = next(40)
    assert.equal(solve(hp, damage, requirement), oracle(hp, damage, requirement))
  }
})

test('3771 rejects mismatched lists', () => {
  assert.throws(() => parseInput('{"hp":5,"damage":[1,2],"requirement":[1]}'))
})
