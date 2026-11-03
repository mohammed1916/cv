import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (source, target) => buildTrace({ source, target }).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length, 'pseudocode line')
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines, 'python line')
    assert.ok(frame.message.length > 0)
  }
}

// Independent oracle: breadth-first search over arrays with values in a small window.
// Any sum-preserving split inside the window is one operation, so a reachable target is found.
function reachableInWindow(source, target, lo, hi) {
  const key = a => a.join(',')
  const seen = new Set([key(source)])
  const queue = [source]
  while (queue.length) {
    const cur = queue.shift()
    if (key(cur) === key(target)) return true
    for (let i = 0; i < cur.length; i++) {
      for (let j = 0; j < cur.length; j++) {
        if (i === j) continue
        const s = cur[i] + cur[j]
        for (let x = lo; x <= hi; x++) {
          const y = s - x
          if (y < lo || y > hi) continue
          const next = [...cur]
          next[i] = x
          next[j] = y
          if (!seen.has(key(next))) {
            seen.add(key(next))
            queue.push(next)
          }
        }
      }
    }
  }
  return false
}

test('4062 equal sums are enough for any target', () => {
  assert.equal(solve([1, 2, 3], [6, 0, 0]), true)
  assert.equal(solve([5, -5], [0, 0]), true)
  assert.equal(solve([4, 4], [4, 4]), true)
})

test('4062 differing sums can never be reached', () => {
  assert.equal(solve([1, 2, 3], [1, 2, 4]), false)
  assert.equal(solve([0, 0], [0, 1]), false)
})

test('4062 the window search agrees with the sum rule on tiny arrays', () => {
  const vals = [-1, 0, 1, 2]
  for (const a of vals) for (const b of vals) for (const c of vals) for (const d of vals) {
    const source = [a, b]
    const target = [c, d]
    const expected = a + b === c + d
    assert.equal(solve(source, target), expected, JSON.stringify({ source, target }))
    if (expected) assert.equal(reachableInWindow(source, target, -3, 3), true)
  }
})

test('4062 three element targets are reached by the construction', () => {
  const source = [3, -2, 7]
  const target = [-4, 9, 3]
  assert.equal(solve(source, target), true)
  assert.equal(reachableInWindow([1, 0, 2], [0, 2, 1], -2, 3), true)
  checkFrames(buildTrace({ source, target }))
})

test('4062 rejects mismatched or too short arrays', () => {
  assert.throws(() => parseInput('{"source":[1],"target":[1]}'))
  assert.throws(() => parseInput('{"source":[1,2],"target":[1,2,3]}'))
})
