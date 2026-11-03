import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

function checkFrames(run) {
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.heap))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

// Brute force: breadth-first search over arrangements. One operation moves any element to the end.
function oracle(nums) {
  const ok = arr => {
    let sum = 0
    for (const v of arr) { sum += v; if (sum < 0) return false }
    return true
  }
  const start = nums.join(',')
  const seen = new Map([[start, 0]])
  let frontier = [nums]
  while (frontier.length) {
    const next = []
    for (const arr of frontier) {
      const depth = seen.get(arr.join(','))
      if (ok(arr)) return depth
      for (let i = 0; i < arr.length; i++) {
        const moved = [...arr.slice(0, i), ...arr.slice(i + 1), arr[i]]
        const key = moved.join(',')
        if (!seen.has(key)) { seen.set(key, depth + 1); next.push(moved) }
      }
    }
    frontier = next
  }
  return -1
}

test('2599 local presets are hand-checked', () => {
  // [-3,2,-1,4,-2]: the first dip at -3 moves -3 to the end, then -1 is the next smallest to move.
  assert.equal(solve([-3, 2, -1, 4, -2]), oracle([-3, 2, -1, 4, -2]))
  assert.equal(solve([1, 2, 3]), 0)
  assert.equal(solve([-1, 1]), 1)
})

test('2599 a single nonnegative value needs no moves', () => {
  assert.equal(solve([0]), 0)
  assert.equal(solve([5]), 0)
})

test('2599 random inputs match the breadth-first oracle', () => {
  let seed = 2599
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 250; t++) {
    const n = 1 + rnd(6)
    let nums = Array.from({ length: n }, () => rnd(15) - 7)
    while (nums.reduce((a, b) => a + b, 0) < 0) nums = [...nums, 9]
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('2599 frame invariants hold', () => {
  checkFrames(buildTrace({ nums: [-3, 2, -1, 4, -2] }))
  checkFrames(buildTrace({ nums: [1, 2, 3] }))
})

test('2599 rejects a negative total', () => {
  assert.throws(() => parseInput('{"nums":[-5,2]}'))
})
