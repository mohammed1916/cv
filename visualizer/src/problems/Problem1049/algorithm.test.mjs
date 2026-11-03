import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, phases, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

function checkFrames(run) {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 0)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

test('own examples: an uneven split, a perfect split and a single stone', () => {
  assert.equal(solve('[5,3,9,4]'), 3)
  assert.equal(solve('[10,10]'), 0)
  assert.equal(solve('[8]'), 8)
})

test('a stone heavier than half the total cannot be placed on the lighter side', () => {
  assert.equal(solve('[1,2,20]'), 17)
})

test('frames record the reachable sums after each stone', () => {
  const run = buildTrace(parseInput('[5,3,9,4]'))
  checkFrames(run)
  assert.equal(run.frames.filter(f => f.phase === 'stone').length, 4)
  assert.deepEqual(run.frames.at(-1).snapshot.sums.includes(9), true)
})

test('invalid inputs are rejected by the parser', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0,3]'))
  assert.throws(() => parseInput('[101]'))
  assert.throws(() => parseInput('[1,2,3,4,5,6,7,8,9,10,11,12,13]'))
})

// Independent oracle: enumerate every subset and pick the split whose difference is smallest.
function oracle(stones) {
  const total = stones.reduce((a, b) => a + b, 0)
  let best = Infinity
  for (let mask = 0; mask < 1 << stones.length; mask++) {
    let sum = 0
    stones.forEach((v, i) => { if (mask & (1 << i)) sum += v })
    best = Math.min(best, Math.abs(total - 2 * sum))
  }
  return best
}

test('seeded random stone lists agree with exhaustive subset search', () => {
  let seed = 1049
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const stones = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(30))
    assert.equal(solve(JSON.stringify(stones)), oracle(stones), JSON.stringify(stones))
  }
})
