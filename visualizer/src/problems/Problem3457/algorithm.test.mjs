import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = pizzas => buildTrace(pizzas).result

test('3457 official-style example', () => {
  // Day 1 gains 8 (heaviest), day 2 discards 7 and gains 6.
  assert.equal(solve([1, 2, 3, 4, 5, 6, 7, 8]), 14)
})

test('3457 a count that is not a multiple of four is rejected', () => {
  assert.throws(() => parseInput('[1,2,3]'))
})

// Independent oracle: try every ordered split of the pizzas into groups of four, one group per day.
// An odd day gains its heaviest pizza and an even day gains its second heaviest.
function oracle(pizzas) {
  let best = 0
  const go = (remaining, day, total) => {
    if (remaining.length === 0) {
      best = Math.max(best, total)
      return
    }
    const choose = (start, group) => {
      if (group.length === 4) {
        const vals = group.map(i => pizzas[i]).sort((a, b) => b - a)
        const gain = day % 2 === 1 ? vals[0] : vals[1]
        go(remaining.filter(i => !group.includes(i)), day + 1, total + gain)
        return
      }
      for (let i = start; i < remaining.length; i++) choose(i + 1, [...group, remaining[i]])
    }
    choose(0, [])
  }
  go(pizzas.map((_, i) => i), 1, 0)
  return best
}

test('3457 random inputs match the group-split oracle', () => {
  let seed = 3457
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const pizzas = Array.from({ length: 4 * (1 + rnd(3)) }, () => 1 + rnd(30))
    assert.equal(solve(pizzas), oracle(pizzas), JSON.stringify(pizzas))
  }
})
