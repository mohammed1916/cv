import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (arr, size) => buildTrace({ arr, size }).result

// Independent oracle: value i goes to the chunk numbered floor(i / size).
function oracle(arr, size) {
  const groups = []
  arr.forEach((v, i) => {
    const g = Math.floor(i / size)
    groups[g] = groups[g] ?? []
    groups[g].push(v)
  })
  return groups.filter(Boolean)
}

test('2677 worked examples', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]])
  assert.deepEqual(solve([7, 8, 9], 5), [[7, 8, 9]])
  assert.deepEqual(solve([], 3), [])
})

test('2677 size one keeps every value alone', () => {
  assert.deepEqual(solve([4, -1, 0], 1), [[4], [-1], [0]])
})

test('2677 brute force agrees on many small inputs', () => {
  for (let n = 0; n <= 7; n++) {
    for (let size = 1; size <= 8; size++) {
      const arr = Array.from({ length: n }, (_, i) => (i * 37) % 19 - 9)
      assert.deepEqual(solve(arr, size), oracle(arr, size), JSON.stringify({ arr, size }))
    }
  }
})

test('2677 rejects a non-positive size', () => {
  assert.throws(() => parseInput('{"arr":[1],"size":0}'))
  assert.throws(() => parseInput('{"arr":[100],"size":1}'))
})

test('2677 frames name real pseudocode and python lines', () => {
  const trace = buildTrace({ arr: [1, 2, 3], size: 2 })
  const pyLines = python.split('\n')
  for (const frame of trace.frames) {
    assert.ok(code[frame.activeLine - 1].text.length > 0)
    assert.ok(pyLines[frame.pythonLine - 1].trim().length > 0)
  }
  assert.equal(trace.frames.at(-1).phase, 'done')
})
