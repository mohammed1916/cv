import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, code, parseInput, python } from './algorithm.js'

const solve = (nums, cost1, cost2) => buildTrace({ nums, cost1, cost2 }).result

test('3139 reference cases', () => {
  assert.equal(solve([4, 1], 5, 2), 15)
  assert.equal(solve([2, 3, 3, 3, 5], 2, 1), 6)
  assert.equal(solve([3, 5, 3], 1, 3), 4)
})

test('3139 an already equal array costs nothing and single values need no pairs', () => {
  assert.equal(solve([7, 7, 7], 4, 1), 0)
  assert.equal(solve([9], 3, 1), 0)
  assert.equal(solve([1, 5], 2, 1), 8)
})

test('3139 the result is reported modulo 1000000007 while the trace keeps the exact cost', () => {
  const run = buildTrace({ nums: [1, 60], cost1: 60, cost2: 60 })
  assert.equal(run.exactCost, '3540')
  assert.equal(run.result, 3540)
})

test('3139 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"nums":[],"cost1":1,"cost2":1}'))
  assert.throws(() => parseInput('{"nums":[0,1],"cost1":1,"cost2":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"cost1":0,"cost2":1}'))
})

// Independent oracle: Dijkstra over all value vectors capped above the maximum,
// using single increments and increments on two distinct indices.
function oracle(nums, cost1, cost2) {
  const cap = Math.max(...nums) + 8
  const n = nums.length
  const key = s => s.join(',')
  const dist = new Map([[key(nums), 0]])
  const queue = [{ s: nums, d: 0 }]
  while (queue.length) {
    queue.sort((a, b) => a.d - b.d)
    const { s, d } = queue.shift()
    if (dist.get(key(s)) < d) continue
    if (s.every(v => v === s[0])) return d
    const moves = []
    for (let i = 0; i < n; i++) {
      if (s[i] < cap) {
        const t = [...s]; t[i]++
        moves.push([t, cost1])
      }
      for (let j = i + 1; j < n; j++) {
        if (s[i] < cap && s[j] < cap) {
          const t = [...s]; t[i]++; t[j]++
          moves.push([t, cost2])
        }
      }
    }
    for (const [t, c] of moves) {
      const nd = d + c
      const k = key(t)
      if (!dist.has(k) || nd < dist.get(k)) {
        dist.set(k, nd)
        queue.push({ s: t, d: nd })
      }
    }
  }
  return Infinity
}

test('3139 random small arrays match a shortest-path oracle', () => {
  let seed = 3139
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(3)
    const nums = Array.from({ length: n }, () => 1 + rnd(5))
    const cost1 = 1 + rnd(6), cost2 = 1 + rnd(6)
    assert.equal(solve(nums, cost1, cost2), oracle(nums, cost1, cost2) % 1000000007, JSON.stringify({ nums, cost1, cost2 }))
  }
})

test('3139 frames keep valid line references', () => {
  const run = buildTrace({ nums: [2, 3, 3, 3, 5], cost1: 2, cost2: 1 })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length, f.phase)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines, f.phase)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('3139 four-element arrays with uneven costs match the oracle', () => {
  let seed = 31390
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 25; t++) {
    const nums = Array.from({ length: 4 }, () => 1 + rnd(4))
    const cost1 = 1 + rnd(9), cost2 = 1 + rnd(9)
    assert.equal(solve(nums, cost1, cost2), oracle(nums, cost1, cost2) % 1000000007, JSON.stringify({ nums, cost1, cost2 }))
  }
})
