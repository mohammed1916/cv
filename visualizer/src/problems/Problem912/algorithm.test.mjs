import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = a => buildTrace(parseInput(JSON.stringify(a))).result
test('official examples', () => {
  assert.deepEqual(solve([5, 2, 3, 1]), [1, 2, 3, 5])
  assert.deepEqual(solve([5, 1, 1, 2, 0, 0]), [0, 0, 1, 1, 2, 5])
})
test('matches native sort on random arrays', () => {
  let seed = 21
  const rnd = m => (seed = (seed * 1103515245 + 12345) % 2147483648) % m
  for (let t = 0; t < 300; t++) {
    const a = Array.from({ length: 1 + rnd(64) }, () => rnd(41) - 20)
    assert.deepEqual(solve(a), [...a].sort((x, y) => x - y))
  }
})
test('frames outside a merge keep a permutation (merges overwrite via copies)', () => {
  const a = [9, -1, 4, 4, 0, 7, 2]
  const run = buildTrace(parseInput(JSON.stringify(a)))
  const key = [...a].sort((x, y) => x - y).join()
  for (const f of run.frames.filter(f => f.phase !== 'place' || f.k === f.hi - 1)) assert.equal([...f.nums].sort((x, y) => x - y).join(), key)
  assert.equal(run.frames.at(-1).phase, 'done')
})
test('rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('"x"'))
})
