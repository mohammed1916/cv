import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code } from './algorithm.js'

const solve = positions => buildTrace(positions).result

// Independent oracle: try every destination on the number line and sum the real move costs.
function oracle(positions) {
  let best = Infinity
  for (let target = 0; target <= 30; target++) {
    const cost = positions.reduce((sum, p) => sum + (Math.abs(p - target) % 2 === 0 ? 0 : 1), 0)
    best = Math.min(best, cost)
  }
  return best
}

test('worked examples', () => {
  assert.equal(solve([1, 2, 3]), 1)
  assert.equal(solve([2, 2, 2, 3]), 1)
  assert.equal(solve([4, 4, 4]), 0)
})

test('random positions agree with the brute-force destination search', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const positions = Array.from({ length: 1 + rand(20) }, () => rand(31))
    assert.equal(solve(positions), oracle(positions), JSON.stringify(positions))
  }
})

test('parser rejects empty input and out-of-range positions', () => {
  assert.throws(() => parseInput('[]'), /1 to 20/)
  assert.throws(() => parseInput('[31]'), /0 to 30/)
  assert.throws(() => parseInput('[1.5]'), /integer/)
  assert.deepEqual(parseInput('[0,7]'), [0, 7])
})

test('every frame has a known phase, narration and a line inside the solver', () => {
  const ids = new Set(phases.map(p => p.id))
  const run = buildTrace([1, 2, 3])
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
