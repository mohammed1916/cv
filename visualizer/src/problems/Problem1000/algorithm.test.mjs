import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (stones, k) => buildTrace({ stones, k }).result

test('1000 hand-checked small cases', () => {
  assert.equal(solve([1, 2, 3], 2), 9)
  assert.equal(solve([4, 1, 1, 6], 3), -1)
  assert.equal(solve([1, 1, 1], 3), 3)
  assert.equal(solve([7], 2), 0)
  assert.equal(solve([2, 5], 2), 7)
})

test('1000 every frame points at real code and Python lines', () => {
  for (const [stones, k] of [[[4, 1, 1, 6], 3], [[1, 2, 3, 4, 5], 3], [[3, 1, 2, 5, 4, 2], 2]]) {
    for (const frame of buildTrace({ stones, k }).frames) {
      assert.ok(frame.activeLine >= 1, frame.message)
      assert.ok(frame.pythonLine >= 1, frame.message)
    }
  }
})

test('1000 rejects malformed input', () => {
  assert.throws(() => parseInput('{"stones":[1,2],"k":1}'), /k is/)
  assert.throws(() => parseInput('{"stones":[0,2],"k":2}'), /stones/)
  assert.throws(() => parseInput('{"stones":[1,2,3,4,5,6,7,8,9],"k":2}'), /stones/)
})

// Independent oracle: try every k-window merge recursively, with no interval table.
function oracle(arr, k) {
  if (arr.length === 1) return 0
  let best = Infinity
  for (let i = 0; i + k <= arr.length; i++) {
    const group = arr.slice(i, i + k)
    const cost = group.reduce((a, b) => a + b, 0)
    const rest = [...arr.slice(0, i), cost, ...arr.slice(i + k)]
    const sub = oracle(rest, k)
    if (sub !== -1 && sub + cost < best) best = sub + cost
  }
  return best === Infinity ? -1 : best
}

test('1000 random rows match a brute-force merge search', () => {
  let seed = 1000
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const n = 1 + rnd(6)
    const stones = Array.from({ length: n }, () => 1 + rnd(9))
    const k = 2 + rnd(4)
    const input = JSON.stringify({ stones, k })
    parseInput(input)
    assert.equal(solve(stones, k), oracle(stones, k), input)
  }
})
