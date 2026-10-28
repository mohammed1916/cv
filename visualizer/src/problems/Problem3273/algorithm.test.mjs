import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3273 official examples', () => {
  assert.equal(solve({ power: 4, damage: [1, 2, 3, 4], health: [4, 5, 6, 8] }), 39)
  assert.equal(solve({ power: 1, damage: [1, 1, 1, 1], health: [1, 2, 3, 4] }), 20)
})

test('3273 a single enemy deals its damage for every second it lives', () => {
  assert.equal(solve({ power: 2, damage: [5], health: [5] }), 15)
})

test('3273 rejects mismatched damage and health lists', () => {
  assert.throws(() => parseInput(JSON.stringify({ power: 1, damage: [1, 2], health: [1] })))
})

// Independent oracle: try every kill order and simulate second by second.
function simulate(order, { power, damage, health }) {
  const remaining = [...health]
  const alive = new Set(damage.map((_, i) => i))
  let total = 0
  while (alive.size > 0) {
    for (const i of alive) total += damage[i]
    const target = order.find(i => alive.has(i))
    remaining[target] -= power
    if (remaining[target] <= 0) alive.delete(target)
  }
  return total
}

function permutations(items) {
  if (items.length <= 1) return [items]
  return items.flatMap((x, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map(p => [x, ...p]))
}

function oracle(input) {
  return Math.min(...permutations(input.damage.map((_, i) => i)).map(order => simulate(order, input)))
}

test('3273 random inputs match a simulated kill-order oracle', () => {
  let seed = 3273
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const k = 1 + rnd(4)
    const input = {
      power: 1 + rnd(6),
      damage: Array.from({ length: k }, () => 1 + rnd(6)),
      health: Array.from({ length: k }, () => 1 + rnd(12)),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
