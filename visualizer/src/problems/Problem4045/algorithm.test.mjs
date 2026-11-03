import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (positions, speeds, distance) => buildTrace({ positions, speeds, distance }).result

test('4045 hand-checked lines', () => {
  assert.equal(solve([1, 3, 6], [2, 1, 1], 2), 2)
  assert.equal(solve([1, 4, 9], [3, 1, 2], 1), 2)
  assert.equal(solve([1, 2, 3], [1, 1, 1], 1), 1)
  assert.equal(solve([1, 5], [1, 4], 1), 2)
})

test('4045 rejects bad input', () => {
  assert.throws(() => parseInput('{"positions":[2,1],"speeds":[1,1],"distance":1}'))
  assert.throws(() => parseInput('{"positions":[1],"speeds":[1,2],"distance":1}'))
})

// Oracle: time sampled on a 1/6 grid. Speeds 1 to 4 and positions up to 10 give merge times whose
// denominators are 1, 2 or 3, so every merge happens on the grid. At each instant, merge every adjacent pair
// that is within distance until nothing changes.
function oracle(positions, speeds, d) {
  const n = positions.length
  const groups = Array.from({ length: n }, (_, i) => i)
  for (let k = 0; k <= 60; k++) {
    let changed = true
    while (changed) {
      changed = false
      for (let idx = 0; idx + 1 < groups.length; idx++) {
        const a = groups[idx]
        const b = groups[idx + 1]
        // Scaled by 6: 6 * (pos_b + v_b * t) - 6 * (pos_a + v_a * t), with t = k / 6.
        const gap6 = 6 * positions[b] + speeds[b] * k - 6 * positions[a] - speeds[a] * k
        if (gap6 <= 6 * d) { groups.splice(idx, 1); changed = true; break }
      }
    }
  }
  return groups.length
}

test('4045 random lines match the grid-time oracle', () => {
  let seed = 4045
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 250; t++) {
    const n = 1 + rnd(6)
    const positions = []
    let p = 1 + rnd(3)
    for (let i = 0; i < n; i++) { positions.push(p); p += 1 + rnd(3); if (p > 10) break }
    const m = positions.length
    const speeds = Array.from({ length: m }, () => 1 + rnd(4))
    const distance = 1 + rnd(4)
    assert.equal(solve(positions.slice(0, m), speeds, distance), oracle(positions.slice(0, m), speeds, distance), JSON.stringify({ positions, speeds, distance }))
  }
})
