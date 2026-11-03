import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = array => buildTrace(parseInput(JSON.stringify({ array })))

test('1533 locates the larger value in worked cases', () => {
  assert.equal(solve([5, 5, 5, 5, 5, 8]).result, 5)
  assert.equal(solve([2, 2, 2, 4, 2]).result, 3)
  assert.equal(solve([7, 9]).result, 1)
  assert.equal(solve([9, 7]).result, 0)
})

test('1533 handles the leftover index for odd windows', () => {
  const run = solve([1, 1, 2])
  assert.equal(run.result, 2)
  assert.equal(run.queries, 1)
  assert.ok(run.frames.some(f => f.phase === 'narrow' && f.message.includes('leftover')))
})

test('1533 rejects arrays that break the promise', () => {
  assert.throws(() => parseInput('{"array":[1,2,3]}'))
  assert.throws(() => parseInput('{"array":[4,4,4]}'))
  assert.throws(() => parseInput('{"array":[1]}'))
})

test('1533 random arrays find the single larger index within log comparisons', () => {
  let seed = 1533
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const n = 2 + rnd(19)
    const base = rnd(9) - 4
    const big = rnd(n)
    const array = Array.from({ length: n }, (_, i) => (i === big ? base + 1 + rnd(5) : base))
    const run = solve(array)
    assert.equal(run.result, big, JSON.stringify(array))
    assert.ok(run.queries <= Math.ceil(Math.log2(n)) + 1, `${n} elements used ${run.queries} comparisons`)
    for (const f of run.frames) {
      assert.ok(f.lo >= 0 && f.hi < n && f.lo <= f.hi || f.phase === 'done')
      if (f.left) assert.equal(f.left[1] - f.left[0], f.right[1] - f.right[0])
    }
  }
})
