import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (spells, potions, success) => buildTrace({ spells, potions, success }).result

test('2300 official examples', () => {
  assert.deepEqual(solve([5, 1, 3], [1, 2, 3, 4, 5], 7), [4, 0, 3])
  assert.deepEqual(solve([3, 1, 2], [8, 5, 8], 16), [2, 0, 2])
})

test('2300 a threshold that divides exactly counts that potion', () => {
  // 3 * 4 = 12 meets success 12 exactly.
  assert.deepEqual(solve([3], [4], 12), [1])
})

test('2300 rejects strengths outside 1 to 20', () => {
  assert.throws(() => parseInput('{"spells":[21],"potions":[1],"success":5}'), /1 to 20/)
})

// Independent oracle: compare every spell against every potion directly.
function oracle(spells, potions, success) {
  return spells.map(s => potions.filter(p => s * p >= success).length)
}

test('2300 random inputs match a pairwise oracle', () => {
  let seed = 2300
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const spells = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(10))
    const potions = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(10))
    const success = 1 + rnd(40)
    assert.deepEqual(solve(spells, potions, success), oracle(spells, potions, success), JSON.stringify({ spells, potions, success }))
  }
})
