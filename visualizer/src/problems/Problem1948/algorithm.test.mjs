import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = paths => buildTrace(parseInput(JSON.stringify(paths))).result
const key = list => list.map(p => p.join('/')).sort()

test('1948 identical folders are removed with their subfolders', () => {
  const paths = [['a'], ['a', 'x'], ['a', 'x', 'y'], ['a', 'z'], ['b'], ['b', 'x'], ['b', 'x', 'y'], ['b', 'z']]
  assert.deepEqual(solve(paths), [])
})

test('1948 a distinct extra folder keeps the outer pair but still removes the matching inner folders', () => {
  const paths = [['a'], ['a', 'x'], ['a', 'x', 'y'], ['a', 'z'], ['b'], ['b', 'w'], ['b', 'x'], ['b', 'x', 'y'], ['b', 'z']]
  assert.deepEqual(key(solve(paths)), key([['a'], ['a', 'z'], ['b'], ['b', 'w'], ['b', 'z']]))
})

test('1948 folders with no subfolders are not duplicates', () => {
  assert.deepEqual(key(solve([['x'], ['y']])), key([['x'], ['y']]))
})

test('1948 top-level and nested folders with the same subtree are both removed', () => {
  // /q holds r, and /s/q holds r too, so both are duplicates. /p/q and /s stay because their subtrees differ.
  const paths = [['p'], ['p', 'q'], ['q'], ['q', 'r'], ['s'], ['s', 'q'], ['s', 'q', 'r']]
  assert.deepEqual(key(solve(paths)), key([['p'], ['p', 'q'], ['s']]))
})
