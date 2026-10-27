import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2127 official examples', () => {
  assert.equal(solve({ favorite: [2, 2, 1, 2] }), 3)
  assert.equal(solve({ favorite: [1, 2, 0] }), 3)
  assert.equal(solve({ favorite: [3, 0, 1, 4, 1] }), 4)
})

test('2127 two-person cycles combine with their chains', () => {
  // Employees 0 and 1 favor each other, and 2 and 3 favor each other; chains 4 -> 0 and 5 -> 2 add two seats.
  assert.equal(solve({ favorite: [1, 0, 3, 2, 0, 2] }), 6)
})

test('2127 rejects a favorite of oneself', () => {
  assert.throws(() => parseInput('{"favorite":[0,1]}'))
})

// Independent oracle: try every subset and every seating order around a table, and keep the largest valid one.
function* permutations(items) {
  if (items.length <= 1) { yield items; return }
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)]
    for (const tail of permutations(rest)) yield [items[i], ...tail]
  }
}
function oracle(favorite) {
  const n = favorite.length
  let best = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    const people = [...Array(n).keys()].filter(i => mask & (1 << i))
    if (people.length < 2 || people.length <= best) continue
    for (const seat of permutations(people)) {
      const k = seat.length
      if (seat.every((p, i) => favorite[p] === seat[(i + 1) % k] || favorite[p] === seat[(i - 1 + k) % k])) {
        best = Math.max(best, k)
        break
      }
    }
  }
  return best
}

test('2127 seeded random inputs match a seating oracle', () => {
  let seed = 2127
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const n = 2 + rnd(5)
    const favorite = Array.from({ length: n }, (_, i) => {
      let f = rnd(n)
      if (f === i) f = (i + 1) % n
      return f
    })
    assert.equal(solve({ favorite }), oracle(favorite), JSON.stringify(favorite))
  }
})
