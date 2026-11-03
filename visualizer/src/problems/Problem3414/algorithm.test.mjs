import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = intervals => {
  const run = buildTrace({ intervals })
  return { score: run.score, indices: run.result }
}

test('3414 a shared endpoint counts as overlap', () => {
  assert.deepEqual(solve([[1, 2, 1], [2, 3, 1], [4, 5, 1]]), { score: 2, indices: [0, 2] })
})

test('3414 a heavy interval can beat several light ones', () => {
  assert.deepEqual(solve([[1, 10, 100], [2, 3, 1], [4, 5, 1], [6, 7, 1], [8, 9, 1]]), { score: 100, indices: [0] })
})

test('3414 ties prefer the lexicographically smaller index list', () => {
  assert.deepEqual(solve([[1, 1, 5], [2, 2, 5]]), { score: 10, indices: [0, 1] })
  assert.deepEqual(solve([[1, 2, 3], [3, 4, 3], [5, 6, 3]]), { score: 9, indices: [0, 1, 2] })
})

test('3414 at most four intervals are chosen', () => {
  const run = solve([[1, 1, 1], [2, 2, 1], [3, 3, 1], [4, 4, 1], [5, 5, 1], [6, 6, 9]])
  assert.equal(run.indices.length <= 4, true)
  assert.equal(run.score, 12)
})

test('3414 rejects malformed intervals', () => {
  assert.throws(() => parseInput('{"intervals":[[3,1,2]]}'))
  assert.throws(() => parseInput('{"intervals":[[1,2]]}'))
})

// Independent oracle: enumerate every bitmask over the intervals.
function oracle(intervals) {
  const n = intervals.length
  let best = null
  for (let mask = 1; mask < 1 << n; mask++) {
    const picked = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) picked.push(i)
    if (picked.length > 4) continue
    let ok = true
    for (const a of picked) for (const b of picked) {
      if (a < b && !(intervals[a][1] < intervals[b][0] || intervals[b][1] < intervals[a][0])) ok = false
    }
    if (!ok) continue
    const score = picked.reduce((s, i) => s + intervals[i][2], 0)
    if (!best || score > best.score || (score === best.score && picked.join() < best.indices.join())) best = { score, indices: picked }
  }
  return best
}

test('3414 agrees with a bitmask oracle on small inputs', () => {
  const cases = [
    [[2, 4, 3], [1, 3, 4], [5, 6, 2], [6, 8, 6], [7, 9, 1]],
    [[1, 5, 2], [3, 4, 2], [6, 7, 2], [8, 9, 2], [10, 11, 2], [12, 13, 1]],
    [[4, 4, 2], [4, 6, 3], [7, 9, 3], [8, 8, 5]],
  ]
  for (const intervals of cases) assert.deepEqual(solve(intervals), oracle(intervals))
})
