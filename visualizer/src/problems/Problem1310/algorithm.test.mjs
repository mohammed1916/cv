import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const brute = (arr, queries) => queries.map(([l, r]) => {
  let x = 0
  for (let i = l; i <= r; i++) x ^= arr[i]
  return x
})

test('hand-checked small cases', () => {
  assert.deepEqual(buildTrace({ arr: [5, 2, 6, 7], queries: [[0, 2], [1, 3], [2, 2]] }).result, [1, 3, 6])
  assert.deepEqual(buildTrace({ arr: [9], queries: [[0, 0]] }).result, [9])
  assert.deepEqual(buildTrace({ arr: [1, 2, 3, 4], queries: [[0, 3]] }).result, [4])
})

test('random arrays agree with brute force over every range', () => {
  let state = 11
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const arr = Array.from({ length: 1 + rand(12) }, () => rand(256))
    const queries = []
    for (let q = 0; q < 1 + rand(8); q++) {
      const l = rand(arr.length); const r = l + rand(arr.length - l)
      queries.push([l, r])
    }
    assert.deepEqual(buildTrace({ arr, queries }).result, brute(arr, queries), JSON.stringify({ arr, queries }))
  }
})

test('every frame has a code line and a Python line', () => {
  for (const frame of buildTrace({ arr: [5, 2, 6, 7], queries: [[0, 2]] }).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 8, frame.message)
    assert.ok(frame.pythonLine >= 1, frame.message)
  }
})

test('rejects bad ranges', () => {
  assert.throws(() => parseInput('{"arr":[1,2],"queries":[[1,0]]}'), /Query/)
  assert.throws(() => parseInput('{"arr":[1,2],"queries":[[0,2]]}'), /Query/)
})
