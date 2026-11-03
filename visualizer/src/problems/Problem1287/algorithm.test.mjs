import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('1287 sample inputs return the quarter value or none', () => {
  assert.equal(solve([1, 1, 2, 3, 3, 3, 4, 5]), 3)
  assert.equal(solve([0, 1, 1, 1, 2, 2, 3, 4, 4, 4, 5]), 1)
  assert.equal(solve([7, 7, 7, 7, 9]), 7)
  assert.equal(solve([1, 2, 4, 4, 5, 6, 7, 8]), null)
  assert.equal(solve([5]), 5)
})

test('1287 exactly a quarter does not qualify', () => {
  assert.equal(solve([1, 2, 3, 4]), null)
  assert.equal(solve([1, 1, 1, 2]), 1)
})

test('1287 frames use declared phases and end on done', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace([2, 2, 2, 9])
  for (const f of run.frames) assert.ok(ids.has(f.phase))
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('1287 rejects unsorted or malformed input', () => {
  assert.throws(() => parseInput('[2,1]'), /sorted/)
  assert.throws(() => parseInput('{}'), /JSON array/)
  assert.throws(() => parseInput('[1.5]'), /integer/)
})

test('1287 random sorted arrays match a brute-force count', () => {
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(20)
    const arr = Array.from({ length: n }, () => rnd(6)).sort((a, b) => a - b)
    let expected = null
    for (const v of new Set(arr)) if (expected === null && arr.filter(x => x === v).length * 4 > n) expected = v
    assert.equal(solve(arr), expected, JSON.stringify(arr))
  }
})
