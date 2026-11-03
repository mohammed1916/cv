import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('1295 sample arrays count the even-digit values', () => {
  assert.equal(solve([12, 345, 2, 6, 7896]), 2)
  assert.equal(solve([555, 901, 482, 1771]), 1)
  assert.equal(solve([1, 22, 333, 4444, 55555, 66666]), 2)
})

test('1295 the boundary value 100000 has six digits and counts', () => {
  assert.equal(solve([100000]), 1)
  assert.equal(solve([9]), 0)
})

test('1295 frames use declared phases and valid line numbers', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace([10, 3])
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1, f.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('1295 rejects malformed or out-of-range values', () => {
  assert.throws(() => parseInput('{}'), /JSON array/)
  assert.throws(() => parseInput('[0]'), /1 to 100000/)
  assert.throws(() => parseInput('[100001]'), /1 to 100000/)
})

test('1295 random values match String-length oracle', () => {
  let seed = 23
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(30) }, () => 1 + rnd(100000))
    const expected = nums.filter(v => String(v).length % 2 === 0).length
    assert.equal(solve(nums), expected, JSON.stringify(nums))
  }
})
