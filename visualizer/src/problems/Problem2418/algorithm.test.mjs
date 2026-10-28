import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (names, heights) => buildTrace(parseInput(JSON.stringify({ names, heights }))).result

test('2418 official examples', () => {
  assert.deepEqual(solve(['Mary', 'John', 'Emma'], [180, 165, 170]), ['Mary', 'Emma', 'John'])
  assert.deepEqual(solve(['Alice', 'Bob'], [155, 185]), ['Bob', 'Alice'])
})

test('2418 a single person is returned unchanged', () => {
  assert.deepEqual(solve(['Ann'], [150]), ['Ann'])
})

test('2418 rejects repeated heights', () => {
  assert.throws(() => parseInput('{"names":["A","B"],"heights":[5,5]}'))
})

// Independent oracle: map each height to its name, then sort the heights from largest to smallest.
function oracle(names, heights) {
  const byHeight = new Map(heights.map((h, i) => [h, names[i]]))
  return [...heights].sort((a, b) => b - a).map(h => byHeight.get(h))
}

test('2418 random inputs match a height-map oracle', () => {
  let seed = 2418
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  for (let t = 0; t < 300; t++) {
    const size = 1 + rnd(12)
    const heights = []
    while (heights.length < size) {
      const h = 1 + rnd(1000)
      if (!heights.includes(h)) heights.push(h)
    }
    const names = heights.map((_, i) => `${letters[i]}${letters[rnd(26)]}`)
    assert.deepEqual(solve(names, heights), oracle(names, heights), JSON.stringify({ names, heights }))
  }
})
