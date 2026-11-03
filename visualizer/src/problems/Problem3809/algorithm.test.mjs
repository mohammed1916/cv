import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

test('3809 worked cases', () => {
  assert.deepEqual(solve({ towers: [[1, 2, 5], [2, 2, 5], [9, 9, 30]], center: [0, 0], radius: 5 }), [1, 2])
  assert.deepEqual(solve({ towers: [[10, 10, 3]], center: [0, 0], radius: 4 }), [-1, -1])
  assert.deepEqual(solve({ towers: [[3, 0, 7], [0, 3, 7], [1, 1, 2]], center: [0, 0], radius: 3 }), [0, 3])
})

test('3809 matches a brute force over every tower', () => {
  const towers = [[4, 1, 6], [2, 2, 9], [0, 5, 9], [7, 7, 20]]
  const center = [1, 1]
  const radius = 6
  const reachable = towers.filter(([x, y]) => Math.abs(x - 1) + Math.abs(y - 1) <= radius)
  reachable.sort((a, b) => b[2] - a[2] || a[0] - b[0] || a[1] - b[1])
  assert.deepEqual(solve({ towers, center, radius }), [reachable[0][0], reachable[0][1]])
})

test('3809 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ towers: [[0, 0, 1]], center: [0, 0], radius: 0 }).frames) assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
})

test('3809 rejects a center with three values', () => {
  assert.throws(() => parseInput('{"towers":[[1,1,1]],"center":[1,1,1],"radius":2}'))
})
