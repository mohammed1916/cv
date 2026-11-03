import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = (jobDifficulty, d) => buildTrace({ jobDifficulty, d }).result

// Independent oracle: try every way to cut the sequence into d nonempty contiguous blocks.
function brute(jobs, d) {
  const n = jobs.length
  if (d > n) return -1
  let best = Infinity
  const go = (start, daysLeft, total) => {
    if (daysLeft === 1) {
      best = Math.min(best, total + Math.max(...jobs.slice(start)))
      return
    }
    for (let end = start + 1; end <= n - (daysLeft - 1); end++) {
      go(end, daysLeft - 1, total + Math.max(...jobs.slice(start, end)))
    }
  }
  go(0, d, 0)
  return best
}

test('sample inputs give the expected costs', () => {
  assert.equal(solve([6, 5, 4, 3, 2, 1], 2), brute([6, 5, 4, 3, 2, 1], 2))
  assert.equal(solve([1, 9, 1, 9, 1], 3), 11)
  assert.equal(solve([7, 7, 7], 3), 21)
})

test('more days than jobs returns -1', () => {
  assert.equal(solve([4, 2], 3), -1)
})

test('one day pays only the maximum difficulty', () => {
  assert.equal(solve([3, 8, 2], 1), 8)
})

test('one job per day pays the sum of all difficulties', () => {
  assert.equal(solve([5, 0, 4], 3), 9)
})

test('random small schedules match the brute-force oracle', () => {
  let seed = 11
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(8)
    const jobs = Array.from({ length: n }, () => rnd(20))
    const d = 1 + rnd(5)
    assert.equal(solve(jobs, d), brute(jobs, d), JSON.stringify({ jobs, d }))
  }
})

test('the parser rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"jobDifficulty":[],"d":1}'), /jobDifficulty/)
  assert.throws(() => parseInput('{"jobDifficulty":[1,2],"d":0}'), /d is/)
})

test('every frame uses a declared phase and a valid code line', () => {
  const run = buildTrace({ jobDifficulty: [1, 9, 1, 9, 1], d: 3 })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
