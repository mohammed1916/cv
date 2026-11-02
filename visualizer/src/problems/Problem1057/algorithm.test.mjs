import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (workers, bikes) => buildTrace({ workers, bikes }).result
const pyLines = python.split('\n').length

test('1057 worked examples', () => {
  assert.deepEqual(solve([[0, 0], [2, 1]], [[1, 2], [3, 3]]), [1, 0])
  assert.deepEqual(solve([[0, 0], [1, 1], [2, 0]], [[1, 0], [2, 2], [2, 1]]), [0, 2, 1])
})

test('1057 ties break by worker index, then bike index', () => {
  assert.deepEqual(solve([[0, 0], [0, 0]], [[1, 0], [0, 1]]), [0, 1])
  assert.deepEqual(solve([[0, 0], [5, 5]], [[0, 0], [5, 5], [9, 9]]), [0, 1])
})

test('1057 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace({ workers: [[0, 0], [2, 1]], bikes: [[1, 2], [3, 3]] })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

test('1057 rejects too few bikes and out-of-range points', () => {
  assert.throws(() => parseInput('{"workers":[[0,0],[1,1]],"bikes":[[2,2]]}'))
  assert.throws(() => parseInput('{"workers":[[0,-1]],"bikes":[[2,2]]}'))
})

// Oracle: repeatedly pick the globally smallest (distance, worker, bike) among still-free pairs.
function oracle(workers, bikes) {
  const answer = new Array(workers.length).fill(-1)
  const used = new Array(bikes.length).fill(false)
  for (let round = 0; round < workers.length; round++) {
    let best = null
    workers.forEach((w, wi) => bikes.forEach((b, bi) => {
      if (answer[wi] !== -1 || used[bi]) return
      const d = Math.abs(w[0] - b[0]) + Math.abs(w[1] - b[1])
      if (!best || d < best.d || (d === best.d && (wi < best.wi || (wi === best.wi && bi < best.bi)))) best = { d, wi, bi }
    }))
    answer[best.wi] = best.bi
    used[best.bi] = true
  }
  return answer
}

test('1057 random instances match a repeated-minimum oracle', () => {
  let seed = 1057
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const point = () => [rnd(8), rnd(8)]
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(5)
    const k = m + rnd(4)
    const workers = Array.from({ length: m }, point)
    const bikes = Array.from({ length: k }, point)
    assert.deepEqual(solve(workers, bikes), oracle(workers, bikes), JSON.stringify({ workers, bikes }))
  }
})
