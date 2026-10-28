import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1723 official examples', () => {
  assert.equal(solve({ jobs: [3, 2, 3], k: 3 }), 3)
  assert.equal(solve({ jobs: [1, 2, 4, 7, 8], k: 2 }), 11)
})

test('1723 one worker takes every job and equal loads stay correct', () => {
  assert.equal(solve({ jobs: [5, 9, 2], k: 1 }), 16)
  assert.equal(solve({ jobs: [4, 4, 4, 4], k: 2 }), 8)
})

test('1723 rejects too many workers and bad job times', () => {
  assert.throws(() => parseInput('{"jobs":[1,2],"k":3}'))
  assert.throws(() => parseInput('{"jobs":[0],"k":1}'))
})

// Independent oracle: try every way to hand the jobs to the workers and keep the best peak.
function oracle({ jobs, k }) {
  let best = Infinity
  const total = k ** jobs.length
  for (let code = 0; code < total; code++) {
    const loads = Array(k).fill(0)
    let rest = code
    for (const job of jobs) {
      loads[rest % k] += job
      rest = Math.floor(rest / k)
    }
    best = Math.min(best, Math.max(...loads))
  }
  return best
}

test('1723 random inputs match an every-assignment oracle', () => {
  let seed = 1723
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const jobs = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(30))
    const input = { jobs, k: 1 + rnd(Math.min(3, jobs.length)) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
