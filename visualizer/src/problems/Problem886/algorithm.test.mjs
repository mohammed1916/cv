import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = o => buildTrace(parseInput(JSON.stringify(o)))

function brute(n, dislikes) {
  for (let mask = 0; mask < (1 << n); mask++) {
    if (dislikes.every(([a, b]) => ((mask >> (a - 1)) & 1) !== ((mask >> (b - 1)) & 1))) return true
  }
  return false
}

test('official examples', () => {
  assert.equal(run({ n: 4, dislikes: [[1, 2], [1, 3], [2, 4]] }).result, true)
  assert.equal(run({ n: 3, dislikes: [[1, 2], [1, 3], [2, 3]] }).result, false)
  assert.equal(run({ n: 5, dislikes: [[1, 2], [2, 3], [3, 4], [4, 5], [1, 5]] }).result, false)
})

test('matches exhaustive 2^n partition search', () => {
  let seed = 5
  const rnd = m => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(9)
    const dislikes = []
    for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) if (rnd(5) === 0) dislikes.push([a, b])
    const trace = run({ n, dislikes })
    assert.equal(trace.result, brute(n, dislikes), JSON.stringify({ n, dislikes }))
    assert.equal(trace.frames.at(-1).phase, 'done')
    assert.equal(trace.frames[0].phase, 'start')
  }
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"n":3,"dislikes":[[2,1]]}'))
  assert.throws(() => parseInput('{"n":3,"dislikes":[[1,4]]}'))
  assert.throws(() => parseInput('{"n":30,"dislikes":[]}'))
})
