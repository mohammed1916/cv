import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const MOD = 1000000007
const solve = hats => buildTrace(parseInput(JSON.stringify({ hats }))).result

test('1434 official examples', () => {
  assert.equal(solve([[3, 4], [4, 5], [5]]), 1)
  assert.equal(solve([[3, 5, 1], [3, 5]]), 4)
})

test('1434 a hat serves only one person', () => {
  // Both people like only hat 2, so nobody can wear a different hat.
  assert.equal(solve([[2], [2]]), 0)
  assert.equal(solve([[1, 2], [2]]), 1)
})

test('1434 rejects bad input', () => {
  assert.throws(() => parseInput('{"hats":[[41]]}'))
  assert.throws(() => parseInput('{"hats":[[2,2]]}'))
  assert.throws(() => parseInput('{"hats":[]}'))
})

// Independent oracle: try every choice of hat for each person in turn, skipping hats already taken.
function oracle(hats) {
  const go = (i, used) => {
    if (i === hats.length) return 1
    let total = 0
    for (const hat of hats[i]) {
      if (used.has(hat)) continue
      used.add(hat)
      total += go(i + 1, used)
      used.delete(hat)
    }
    return total
  }
  return go(0, new Set()) % MOD
}

test('1434 random assignments match the search oracle', () => {
  let seed = 1434
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const people = 1 + rnd(4)
    const hats = Array.from({ length: people }, () => {
      const pool = Array.from({ length: 8 }, (_, i) => i + 1)
      const options = []
      const count = 1 + rnd(4)
      for (let k = 0; k < count; k++) options.push(pool.splice(rnd(pool.length), 1)[0])
      return options
    })
    assert.equal(solve(hats), oracle(hats), JSON.stringify(hats))
  }
})
