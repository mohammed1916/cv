import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (jobs, workers) => buildTrace(parseInput(JSON.stringify({ jobs, workers }))).result

test('2323 worked examples', () => {
  assert.equal(solve([5, 7, 9], [2, 3, 4]), 3)
  assert.equal(solve([10, 20, 30], [1, 2, 3]), 10)
  assert.equal(solve([7], [2]), 4)
  assert.equal(solve([1, 1], [1, 100]), 1)
})

test('2323 rejects invalid input', () => {
  assert.throws(() => parseInput('{"jobs":[1],"workers":[1,2]}'))
  assert.throws(() => parseInput('{"jobs":[0],"workers":[1]}'))
  assert.throws(() => parseInput('{"jobs":[1,2,3,4,5,6,7],"workers":[1,2,3,4,5,6,7]}'))
})

// Oracle: try every assignment of workers to jobs.
function oracle(jobs, workers) {
  let best = Infinity
  const used = Array(workers.length).fill(false)
  const go = (i, worst) => {
    if (worst >= best) return
    if (i === jobs.length) { best = worst; return }
    for (let w = 0; w < workers.length; w++) {
      if (used[w]) continue
      used[w] = true
      go(i + 1, Math.max(worst, Math.ceil(jobs[i] / workers[w])))
      used[w] = false
    }
  }
  go(0, 0)
  return best
}

test('2323 random inputs match an assignment oracle', () => {
  let seed = 2323
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5)
    const jobs = Array.from({ length: n }, () => 1 + rnd(40))
    const workers = Array.from({ length: n }, () => 1 + rnd(9))
    assert.equal(solve(jobs, workers), oracle(jobs, workers), JSON.stringify({ jobs, workers }))
  }
})

test('2323 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"jobs":[5,7,9],"workers":[2,3,4]}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
