import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = arr => buildTrace({ arr }).result

test('1200 sample walkthroughs', () => {
  assert.deepEqual(solve([18, -4, 7, 25, 2, 12, -9, 30, 3, 13]), [[2, 3], [12, 13]])
  assert.deepEqual(solve([-8, 15]), [[-8, 15]])
  assert.deepEqual(solve([14, 2, 10, 6]), [[2, 6], [6, 10], [10, 14]])
  assert.deepEqual(solve([-9, -1, 1, 8, 17]), [[-1, 1]])
})

// Independent oracle: compare every pair of values, with no sorting.
function oracle(arr) {
  let best = Infinity
  for (const a of arr) for (const b of arr) if (a < b) best = Math.min(best, b - a)
  const out = []
  for (const a of arr) for (const b of arr) if (a < b && b - a === best) out.push([a, b])
  return out.sort((x, y) => x[0] - y[0] || x[1] - y[1])
}

let seed = 1200
const rand = n => { seed = (seed * 1664525 + 1013904223) % 4294967296; return Math.floor(seed / 65536) % n }

test('1200 random distinct arrays match the all-pairs oracle', () => {
  for (let trial = 0; trial < 400; trial++) {
    const size = 2 + rand(9)
    const pool = new Set()
    while (pool.size < size) pool.add(rand(41) - 20)
    const arr = [...pool]
    assert.deepEqual(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})

test('1200 trace records a reset and an append and ends with the answer', () => {
  const { frames } = buildTrace({ arr: [1, 2, 4, 5, 9] })
  assert.ok(frames.some(f => f.activeLine === 5))
  assert.ok(frames.some(f => f.activeLine === 6))
  assert.equal(frames.at(-1).phase, 'done')
  assert.ok(frames.every(f => f.snapshot && typeof f.message === 'string'))
  assert.deepEqual(frames.at(-1).snapshot.pairs, [[1, 2], [4, 5]])
})

test('1200 phases and code are exported for the shared shell', () => {
  assert.deepEqual(phases.map(p => p.id), ['start', 'inspect', 'update', 'done'])
  assert.equal(code.length, 7)
  assert.ok(python.includes('minimum_abs_difference'))
})

test('1200 rejects bad input', () => {
  assert.throws(() => parseInput('{"arr":[5]}'), /2 to 30/)
  assert.throws(() => parseInput('{"arr":[1,1]}'), /distinct/)
  assert.throws(() => parseInput('{"arr":[1,20000]}'), /-10000 to 10000/)
})
