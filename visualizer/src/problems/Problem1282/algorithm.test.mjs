import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = sizes => buildTrace(parseInput(JSON.stringify(sizes))).result

test('1282 sample inputs produce complete groups of the requested size', () => {
  const groups = solve([1, 3, 2, 2, 3, 3, 1])
  assert.deepEqual(groups.map(g => g.length).sort((a, b) => a - b), [1, 1, 2, 3])
  assert.deepEqual(solve([4, 4, 4, 4, 2, 2]), [[0, 1, 2, 3], [4, 5]])
  assert.deepEqual(solve([1]), [[0]])
})

test('1282 frames use only declared phases and report the final result', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace([2, 1, 2])
  for (const f of run.frames) assert.ok(ids.has(f.phase), f.phase)
  assert.deepEqual(run.result, [[1], [0, 2]])
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('1282 rejects malformed or impossible size lists', () => {
  assert.throws(() => parseInput('{"a":1}'), /JSON array/)
  assert.throws(() => parseInput('[0,1]'), /1 to the number/)
  assert.throws(() => parseInput('[2,2,2]'), /cannot be split/)
})

test('1282 random valid inputs match an independent partition oracle', () => {
  let seed = 11
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const sizes = Array.from({ length: n }, () => 1 + rnd(n))
    let valid = true
    const counts = new Map(); for (const s of sizes) counts.set(s, (counts.get(s) ?? 0) + 1)
    for (const [s, c] of counts) if (c % s) valid = false
    if (!valid) continue
    const groups = solve(sizes)
    const seen = groups.flat().sort((a, b) => a - b)
    assert.deepEqual(seen, sizes.map((_, i) => i), JSON.stringify(sizes))
    for (const g of groups) {
      assert.ok(g.length > 0)
      assert.ok(g.every(p => sizes[p] === g.length), JSON.stringify(sizes))
    }
  }
})
