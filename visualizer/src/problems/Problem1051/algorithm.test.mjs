import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const solve = heights => buildTrace({ heights }).result

// Independent oracle: sort a copy with a counting table and compare positions.
function oracle(heights) {
  const counts = new Array(101).fill(0)
  for (const h of heights) counts[h] += 1
  const sorted = []
  for (let v = 0; v <= 100; v++) for (let k = 0; k < counts[v]; k++) sorted.push(v)
  return heights.reduce((total, h, i) => total + (h !== sorted[i] ? 1 : 0), 0)
}

test('first authored sample counts seven mismatches', () => {
  assert.equal(solve([6, 3, 5, 3, 8, 4, 6, 2, 7, 5]), 7)
})

test('edge cases: sorted, all equal, and reversed odd length', () => {
  assert.equal(solve([2, 2, 4, 6, 6, 9]), 0)
  assert.equal(solve([7, 7, 7, 7]), 0)
  assert.equal(solve([9, 7, 5, 3, 1]), 4)
})

test('random lineups agree with the counting oracle', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 500; t++) {
    const n = 1 + rand(30)
    const heights = Array.from({ length: n }, () => 1 + rand(100))
    assert.equal(solve(heights), oracle(heights), JSON.stringify(heights))
  }
})

test('parser rejects out-of-range and malformed input', () => {
  assert.throws(() => parseInput('{"heights":[]}'), /1 to 30/)
  assert.throws(() => parseInput('{"heights":[0]}'), /1 to 100/)
  assert.throws(() => parseInput('{"heights":[1.5]}'), /integer/)
  assert.throws(() => parseInput('[1,2]'), /heights array/)
})

test('every frame names a phase, a code line and a message; the last frame is done', () => {
  const run = buildTrace({ heights: [6, 3, 5] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.message.length > 10)
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.snapshot)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(code.length, python.split('\n').length)
})
