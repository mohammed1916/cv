import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (colors, k) => buildTrace(parseInput(JSON.stringify({ colors, k }))).result

test('3208 official examples', () => {
  assert.equal(solve([0, 1, 0, 1, 0], 3), 3)
  assert.equal(solve([0, 1, 0, 0, 1, 0, 1], 6), 2)
  assert.equal(solve([0, 1, 0, 1, 0, 1], 3), 6)
})

test('3208 a group that wraps around the end of the circle', () => {
  assert.equal(solve([1, 0, 0, 1], 3), 0)
  assert.equal(solve([0, 0, 1], 3), 1)
})

test('3208 rejects k smaller than 3', () => {
  assert.throws(() => parseInput('{"colors":[0,1,0],"k":2}'))
})

// Independent oracle: test every circular start by checking each adjacent pair inside the group.
function oracle(colors, k) {
  const n = colors.length
  let count = 0
  for (let s = 0; s < n; s++) {
    let ok = true
    for (let j = 0; j + 1 < k; j++) {
      if (colors[(s + j) % n] === colors[(s + j + 1) % n]) { ok = false; break }
    }
    if (ok) count++
  }
  return count
}

test('3208 random circles match a start-by-start oracle', () => {
  let seed = 3208
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 3 + rnd(14)
    const colors = Array.from({ length: len }, () => rnd(2))
    const k = 3 + rnd(len - 2)
    assert.equal(solve(colors, k), oracle(colors, k), JSON.stringify({ colors, k }))
  }
})
