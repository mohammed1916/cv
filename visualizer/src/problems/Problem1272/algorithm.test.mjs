import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (intervals, toBeRemoved) => buildTrace({ intervals, toBeRemoved }).result

function checkFrames(run) {
  const pyLines = python.split('\n')
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && pyLines[frame.pythonLine - 1].trim().length > 0)
    assert.ok(frame.message.length > 0)
  }
}

test('1272 worked examples', () => {
  assert.deepEqual(solve([[0, 2], [3, 5], [6, 9]], [1, 4]), [[0, 1], [4, 5], [6, 9]])
  assert.deepEqual(solve([[0, 5]], [0, 5]), [])
  assert.deepEqual(solve([[0, 10]], [3, 5]), [[0, 3], [5, 10]])
})

test('1272 edge cases: cut touching an endpoint keeps the interval whole', () => {
  assert.deepEqual(solve([[0, 2]], [2, 4]), [[0, 2]])
  assert.deepEqual(solve([[3, 6]], [0, 3]), [[3, 6]])
  assert.deepEqual(solve([], [1, 2]), [])
})

test('1272 frame invariants hold on examples', () => {
  checkFrames(buildTrace({ intervals: [[0, 2], [3, 5], [6, 9]], toBeRemoved: [1, 4] }))
})

function oracle(intervals, [a, b]) {
  const out = []
  for (const [s, e] of intervals) {
    let run = null
    for (let x = s; x < e; x++) {
      const keep = x < a || x >= b
      if (keep) {
        if (run && run[1] === x) run[1] = x + 1
        else { run = [x, x + 1]; out.push(run) }
      } else run = null
    }
  }
  return out
}

test('1272 random inputs match a cell-by-cell oracle', () => {
  let seed = 1272
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let trial = 0; trial < 300; trial++) {
    const intervals = []
    let cursor = rand(3)
    while (intervals.length < 6 && cursor < 28) {
      const s = cursor + rand(3)
      const e = s + 1 + rand(4)
      if (e > 30) break
      intervals.push([s, e])
      cursor = e + rand(2)
    }
    const a = rand(29)
    const b = a + 1 + rand(30 - a)
    const expected = oracle(intervals, [a, b])
    assert.deepEqual(solve(intervals, [a, b]), expected, JSON.stringify({ intervals, a, b }))
  }
})

test('1272 rejects malformed input', () => {
  assert.throws(() => parseInput('{"intervals":[[3,4],[0,1]],"toBeRemoved":[1,2]}'))
  assert.throws(() => parseInput('{"intervals":[[2,2]],"toBeRemoved":[1,2]}'))
  assert.throws(() => parseInput('{"intervals":[],"toBeRemoved":[5,31]}'))
})
