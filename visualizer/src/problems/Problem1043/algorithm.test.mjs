import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, phases, code, python } from './algorithm.js'

const solve = (arr, k) => buildTrace(parseInput(JSON.stringify({ arr, k }))).result

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

test('own examples: mixed blocks, a peak inside a block, and a single value', () => {
  assert.equal(solve([4, 1, 7, 2], 2), 22)
  assert.equal(solve([1, 9, 2, 8, 3], 3), 43)
  assert.equal(solve([5], 1), 5)
})

test('block length one keeps the original sum', () => {
  assert.equal(solve([3, 6, 2], 1), 11)
})

test('one block covering everything uses the global maximum', () => {
  assert.equal(solve([2, 9, 4], 3), 27)
})

test('every frame carries a phase, a code line and a snapshot', () => {
  checkFrames(buildTrace(parseInput(JSON.stringify({ arr: [4, 1, 7, 2], k: 2 }))))
})

test('invalid inputs are rejected by the parser', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('{"arr":[],"k":1}'))
  assert.throws(() => parseInput('{"arr":[1,2],"k":3}'))
  assert.throws(() => parseInput('{"arr":[1,-2],"k":1}'))
})

// Independent oracle: enumerate every partition by recursion over the remaining suffix.
function brute(arr, k, start = 0) {
  if (start === arr.length) return 0
  let best = -Infinity
  let mx = 0
  for (let len = 1; len <= Math.min(k, arr.length - start); len++) {
    mx = Math.max(mx, arr[start + len - 1])
    best = Math.max(best, len * mx + brute(arr, k, start + len))
  }
  return best
}

test('seeded random arrays agree with exhaustive partition search', () => {
  let seed = 1043
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(8)
    const arr = Array.from({ length: n }, () => rnd(20))
    const k = 1 + rnd(n)
    assert.equal(solve(arr, k), brute(arr, k), JSON.stringify({ arr, k }))
  }
})
