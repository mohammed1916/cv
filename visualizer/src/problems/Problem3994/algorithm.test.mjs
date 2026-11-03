import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, a, b) => buildTrace({ nums, a, b }).result

function checkFrames(run) {
  const lines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, 'activeLine in range')
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= lines, 'pythonLine in range')
    assert.equal(typeof f.message, 'string')
  }
}

const groupOf = (x, a, b) => (x < a ? 0 : x <= b ? 1 : 2)

// Brute force: BFS over arrangements by adjacent swaps until the groups are in band order.
function bfs(nums, a, b) {
  const sorted = arr => arr.every((x, i) => i === 0 || groupOf(arr[i - 1], a, b) <= groupOf(x, a, b))
  const key = arr => arr.join(',')
  const start = nums
  const seen = new Set([key(start)])
  let frontier = [start]
  let dist = 0
  while (frontier.length) {
    if (frontier.some(sorted)) return dist
    const next = []
    for (const arr of frontier) {
      for (let i = 0; i + 1 < arr.length; i++) {
        const copy = arr.slice()
        ;[copy[i], copy[i + 1]] = [copy[i + 1], copy[i]]
        const k = key(copy)
        if (!seen.has(k)) { seen.add(k); next.push(copy) }
      }
    }
    frontier = next
    dist++
  }
  return -1
}

test('3994 authored examples', () => {
  assert.equal(solve([5, 1, 8, 3, 9, 2], 3, 6), 6)
  assert.equal(solve([7, 7, 2, 9], 5, 8), 2)
})

test('3994 already partitioned input costs nothing', () => {
  assert.equal(solve([1, 2, 4, 9], 2, 4), 0)
})

test('3994 rejects bad bounds', () => {
  assert.throws(() => parseInput('{"nums":[1],"a":3,"b":3}'))
  assert.throws(() => parseInput('{"nums":[1],"a":0,"b":3}'))
  assert.throws(() => parseInput('{"nums":[21],"a":1,"b":3}'))
})

test('3994 small arrays match a breadth-first search over swaps', () => {
  let seed = 3994
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const n = 1 + rnd(6)
    const nums = Array.from({ length: n }, () => 1 + rnd(9))
    const a = 1 + rnd(7)
    const b = a + 1 + rnd(9 - a)
    const run = buildTrace({ nums, a, b })
    assert.equal(run.result, bfs(nums, a, b), JSON.stringify({ nums, a, b }))
    checkFrames(run)
  }
})
