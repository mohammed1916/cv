import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (robots, distance, walls) => buildTrace({ robots, distance, walls }).result

test('3661 invented example', () => {
  // Sorted robots 6, 15, 20. Best: 6 fires left (3, 5), 15 fires right (18), 20 fires right (21, 22) = 5.
  assert.equal(solve([6, 15, 20], [4, 3, 2], [3, 5, 9, 18, 21, 22]), 5)
})

test('3661 a robot at a wall position destroys that wall', () => {
  assert.equal(solve([7], [1], [7]), 1)
  assert.equal(solve([3, 4], [5, 5], [4]), 1)
})

// Oracle: try every direction assignment and simulate each bullet directly.
function brute(robots, distance, walls) {
  const n = robots.length
  let best = 0
  for (let mask = 0; mask < 2 ** n; mask++) {
    const destroyed = new Set()
    for (let i = 0; i < n; i++) {
      const step = (mask >> i) & 1 ? 1 : -1
      for (let x = robots[i]; Math.abs(x - robots[i]) <= distance[i]; x += step) {
        if (x !== robots[i] && robots.includes(x)) break
        if (walls.includes(x)) destroyed.add(x)
      }
    }
    best = Math.max(best, destroyed.size)
  }
  return best
}

test('3661 random small inputs match the brute-force oracle', () => {
  let seed = 3661
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  const distinct = (count, max) => {
    const set = new Set()
    while (set.size < count) set.add(1 + rand(max))
    return [...set]
  }
  for (let t = 0; t < 400; t++) {
    const robots = distinct(1 + rand(4), 30)
    const distance = robots.map(() => 1 + rand(8))
    const walls = distinct(1 + rand(10), 30)
    assert.equal(solve(robots, distance, walls), brute(robots, distance, walls))
  }
})

test('3661 rejects duplicate robot positions', () => {
  assert.throws(() => parseInput('{"robots":[2,2],"distance":[1,1],"walls":[3]}'))
})
