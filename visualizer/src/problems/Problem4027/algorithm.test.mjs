import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (start, requests) => buildTrace({ start, requests }).result

test('4027 one request waits for arrival or travels, whichever is later', () => {
  assert.equal(solve(1, [[0, 1]]), 0)
  assert.equal(solve(1, [[0, 4]]), 3)
  assert.equal(solve(1, [[10, 4]]), 10)
  assert.equal(solve(3, [[1, 5]]), 2)
})

test('4027 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace({ start: 1, requests: [[0, 5], [3, 2], [4, 4]] })
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, frame.phase)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, frame.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('4027 rejects malformed requests', () => {
  assert.throws(() => parseInput('{"start":1,"requests":[]}'))
  assert.throws(() => parseInput('{"start":1,"requests":[[1]]}'))
  assert.throws(() => parseInput('{"start":1,"requests":[[-1,2]]}'))
  assert.throws(() => parseInput('{"start":0,"requests":[[1,2]]}'))
})

// Independent oracle: try every visiting order; each request is served once the elevator is on its floor
// at or after its arrival, and waiting is allowed.
function oracle(start, requests) {
  let best = Infinity
  const perm = (remaining, here, time) => {
    if (remaining.length === 0) {
      best = Math.min(best, time)
      return
    }
    remaining.forEach((r, idx) => {
      const [arrival, floor] = r
      const t = Math.max(time + Math.abs(here - floor), arrival)
      perm(remaining.filter((_, k) => k !== idx), floor, t)
    })
  }
  perm(requests, start, 0)
  return best
}

test('4027 random inputs match a permutation oracle', () => {
  let seed = 4027
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const start = 1 + rnd(6)
    const requests = Array.from({ length: 1 + rnd(5) }, () => [rnd(12), 1 + rnd(6)])
    assert.equal(solve(start, requests), oracle(start, requests), JSON.stringify({ start, requests }))
  }
})
