import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = weight => buildTrace({ weight }).result

test('1196 sample walkthroughs', () => {
  assert.equal(solve([650, 140, 920, 310, 480, 760, 220, 830, 170, 590, 1100]), 9)
  assert.equal(solve([5000]), 1)
  assert.equal(solve([5001, 7000]), 0)
  assert.equal(solve([400, 700, 900, 600]), 4)
})

// Independent oracle: try every subset of a small list and keep the largest one within capacity.
function oracle(weight) {
  let best = 0
  for (let mask = 0; mask < 1 << weight.length; mask++) {
    let sum = 0
    let size = 0
    weight.forEach((w, i) => { if (mask & (1 << i)) { sum += w; size++ } })
    if (sum <= 5000 && size > best) best = size
  }
  return best
}

let seed = 1196
const rand = n => { seed = (seed * 1664525 + 1013904223) % 4294967296; return Math.floor(seed / 65536) % n }

test('1196 random small lists match the subset oracle', () => {
  for (let trial = 0; trial < 400; trial++) {
    const size = 1 + rand(10)
    const weight = Array.from({ length: size }, () => 1 + rand(6000))
    assert.equal(solve(weight), oracle(weight), JSON.stringify(weight))
  }
})

test('1196 trace is ordered, stops at the first misfit and ends with a snapshot', () => {
  const { frames } = buildTrace({ weight: [400, 700, 900, 600, 5200] })
  assert.deepEqual(frames.map(f => f.phase)[0], 'start')
  assert.equal(frames.at(-1).phase, 'done')
  assert.ok(frames.every(f => typeof f.message === 'string' && f.snapshot && typeof f.activeLine === 'number'))
  assert.ok(frames.some(f => f.phase === 'inspect' && f.snapshot.fits === false))
  assert.equal(frames.at(-1).snapshot.total, 2600)
})

test('1196 phases and code lines are consistent', () => {
  assert.deepEqual(phases.map(p => p.id), ['start', 'inspect', 'update', 'done'])
  assert.equal(code.length, 6)
  assert.ok(python.includes('def max_apples'))
})

test('1196 rejects bad input', () => {
  assert.throws(() => parseInput('{"weight":[]}'), /1 to 30/)
  assert.throws(() => parseInput('{"weight":[0]}'), /integer from 1 to 10000/)
  assert.throws(() => parseInput('{"weights":[1]}'), /weight array/)
})
