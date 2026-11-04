import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = arr => buildTrace({ arr }).result

test('1207 sample walkthroughs', () => {
  assert.equal(solve([1, 2, 2, 1, 1, 3]), true)
  assert.equal(solve([1, 2]), false)
  assert.equal(solve([5]), true)
  assert.equal(solve([0, 0, -1, -1, -1, 2]), true)
  assert.equal(solve([1, 1, 2, 2]), false)
})

// Independent oracle: compare every pair of distinct values' counts directly.
function oracle(arr) {
  const values = [...new Set(arr)]
  const count = v => arr.filter(x => x === v).length
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      if (count(values[i]) === count(values[j])) return false
    }
  }
  return true
}

let seed = 1207
const rand = n => { seed = (seed * 1664525 + 1013904223) % 4294967296; return Math.floor(seed / 65536) % n }

test('1207 random arrays match the pairwise oracle', () => {
  for (let trial = 0; trial < 400; trial++) {
    const arr = Array.from({ length: 1 + rand(20) }, () => rand(7) - 3)
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})

test('1207 trace stops at the first clash and records the clashing values', () => {
  const { frames } = buildTrace({ arr: [1, 2] })
  const clash = frames.find(f => f.snapshot.clash !== undefined)
  assert.ok(clash, 'a clash frame exists')
  assert.equal(frames.at(-1).phase, 'done')
  assert.equal(frames.at(-1).snapshot.result, false)
  assert.ok(frames.every(f => f.snapshot && typeof f.message === 'string'))
})

test('1207 phases and code are exported for the shared shell', () => {
  assert.deepEqual(phases.map(p => p.id), ['start', 'inspect', 'update', 'done'])
  assert.equal(code.length, 10)
  assert.ok(python.includes('unique_occurrences'))
})

test('1207 rejects bad input', () => {
  assert.throws(() => parseInput('{"arr":[]}'), /1 to 40/)
  assert.throws(() => parseInput('{"arr":[1.5]}'), /integer from -1000 to 1000/)
  assert.throws(() => parseInput('{"values":[1]}'), /arr array/)
})
