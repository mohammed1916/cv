import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('3160 official examples', () => {
  assert.deepEqual(solve('{"limit":4,"queries":[[1,4],[2,5],[1,3],[3,4]]}'), [1, 2, 2, 3])
  assert.deepEqual(solve('{"limit":4,"queries":[[0,1],[1,2],[2,2],[3,4],[4,5]]}'), [1, 2, 2, 3, 4])
})

test('3160 repainting the last ball of a color removes that color', () => {
  assert.deepEqual(solve('{"limit":3,"queries":[[0,1],[0,2],[0,3]]}'), [1, 1, 1])
})

test('3160 rejects a color of zero', () => {
  assert.throws(() => parseInput('{"limit":2,"queries":[[0,0]]}'))
})

// Independent oracle: after each query, rebuild the colors of all balls from the full query prefix.
function oracle(queries) {
  return queries.map((_, i) => {
    const latest = new Map()
    for (const [ball, color] of queries.slice(0, i + 1)) latest.set(ball, color)
    return new Set(latest.values()).size
  })
}

test('3160 random queries match a rebuild-from-prefix oracle', () => {
  let seed = 3160
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let round = 0; round < 300; round++) {
    const limit = 1 + rnd(6)
    const queries = Array.from({ length: 1 + rnd(10) }, () => [rnd(limit + 1), 1 + rnd(limit)])
    assert.deepEqual(solve(JSON.stringify({ limit, queries })), oracle(queries), JSON.stringify({ limit, queries }))
  }
})
