import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = centers => buildTrace(centers).result

test('3155 worked centers', () => {
  assert.deepEqual(solve([[4, 0, 2, 3]]), [1])
  assert.deepEqual(solve([[5, 10, 0, 5]]), [2])
  assert.deepEqual(solve([[3, 0, 0, 0]]), [3])
  assert.deepEqual(solve([[2, 1, 5, 100]]), [0])
  assert.deepEqual(solve([[6, 4, 3, 4]]), [3])
})

// Oracle: enumerate every (upgraded, sold) split that fits the servers and keep the largest upgrade count.
function oracle([servers, money, sell, cost]) {
  let best = 0
  for (let k = 0; k <= servers; k++) {
    for (let s = 0; s + k <= servers; s++) {
      if (money + sell * s >= cost * k) best = Math.max(best, k)
    }
  }
  return best
}

test('3155 random centers match an enumerate-every-split oracle', () => {
  let seed = 3155
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 300; trial++) {
    const centers = Array.from({ length: 1 + rnd(4) }, () => [rnd(9), rnd(30), rnd(12), rnd(12)])
    assert.deepEqual(solve(centers), centers.map(oracle), JSON.stringify(centers))
  }
})

test('3155 frames carry real pseudocode and python lines and the ledger numbers', () => {
  const run = buildTrace([[5, 10, 0, 5], [2, 1, 5, 100]])
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 9, `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 12, `pythonLine ${frame.pythonLine}`)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('3155 parse rejects malformed centers', () => {
  assert.throws(() => parseInput('[[1,2,3]]'))
  assert.throws(() => parseInput('[[21,0,0,0]]'))
  assert.throws(() => parseInput('[[1,-1,0,0]]'))
  assert.deepEqual(parseInput('[[4,0,2,3]]'), [[4, 0, 2, 3]])
})
