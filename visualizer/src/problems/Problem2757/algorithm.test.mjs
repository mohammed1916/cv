import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (arr, steps, startIndex) => buildTrace({ arr, steps, startIndex }).result

test('2757 hand-computed walks', () => {
  // start 2 -> 2+2=4 -> 4-4=0 -> 0+10=10 mod 7=3 -> 3-1=2
  assert.deepEqual(solve([7, 3, 9, 1, 6, 4, 8], [2, -4, 10, -1], 2), [9, 6, 7, 1, 9])
  // start 1 -> 9 mod 4=1 -> -11 mod 4=1 -> 1 -> 4 mod 4=0
  assert.deepEqual(solve([5, 10, 15, 20], [8, -12, 0, 3], 1), [10, 10, 10, 10, 5])
})

test('2757 edge cases', () => {
  assert.deepEqual(solve([42], [3, -7], 0), [42, 42, 42])
  assert.deepEqual(solve([1, 2], [-1], 0), [1, 2])
  assert.deepEqual(solve([1, 2, 3], [1], 2), [3, 1])
  assert.deepEqual(solve([0, -5], [-10000, 10000, 1], 1), [-5, -5, -5, 0])
})

test('2757 parseInput rejects invalid input', () => {
  assert.doesNotThrow(() => parseInput('{"arr":[1],"steps":[0],"startIndex":0}'))
  assert.throws(() => parseInput('{"arr":[],"steps":[1],"startIndex":0}'))
  assert.throws(() => parseInput('{"arr":[1],"steps":[],"startIndex":0}'))
  assert.throws(() => parseInput('{"arr":[1,2],"steps":[1],"startIndex":2}'))
  assert.throws(() => parseInput('{"arr":[1,2],"steps":[10001],"startIndex":0}'))
  assert.throws(() => parseInput('[1,2]'))
})

// Oracle: really walk one position at a time, stepping off each end onto the other.
function walk(arr, steps, start) {
  const out = [arr[start]]
  let i = start
  for (const jump of steps) {
    for (let k = 0; k < Math.abs(jump); k++) {
      if (jump > 0) i = i === arr.length - 1 ? 0 : i + 1
      else i = i === 0 ? arr.length - 1 : i - 1
    }
    out.push(arr[i])
  }
  return out
}

test('2757 matches a one-position-at-a-time walk', () => {
  let seed = 11
  const rnd = m => (seed = (seed * 1103515245 + 12345) % 2147483648) % m
  for (let t = 0; t < 400; t++) {
    const arr = Array.from({ length: 1 + rnd(12) }, () => rnd(41) - 20)
    const steps = Array.from({ length: 1 + rnd(8) }, () => rnd(101) - 50)
    const start = rnd(arr.length)
    assert.deepEqual(solve(arr, steps, start), walk(arr, steps, start))
  }
})

test('2757 frames are well formed', () => {
  const run = buildTrace({ arr: [7, 3, 9, 1], steps: [5, -6, 0], startIndex: 1 })
  const ids = new Set(phases.map(p => p.id))
  const lines = python.trim().split('\n')
  for (const f of run.frames) {
    assert.ok(ids.has(f.phase))
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= lines.length && lines[f.pythonLine - 1].trim())
    assert.ok(f.message)
    assert.ok(f.index >= 0 && f.index < 4)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.deepEqual(run.frames.at(-1).output, run.result)
  const moves = run.frames.filter(f => f.phase === 'move')
  assert.equal(moves.length, 3)
  assert.equal(moves[0].wraps, 1) // 1 + 5 = 6 crosses the seam once
  assert.equal(moves[1].laps, 1)
})
