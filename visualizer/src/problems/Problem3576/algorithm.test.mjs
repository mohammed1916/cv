import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python, code, phases } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3576 hand-computed cases', () => {
  assert.equal(solve([-1, 1, 1, 1, -1, 1], 3), true) // all -1 takes 3 moves, all 1 takes 4
  assert.equal(solve([-1, 1, 1, 1, -1, 1], 2), false)
  assert.equal(solve([1, -1, 1, 1], 4), false) // one -1 and three 1s: both counts are odd
  assert.equal(solve([-1], 1), true)
  assert.equal(solve([1, 1, 1], 1), true)
  assert.equal(solve([-1, -1], 1), true)
  assert.equal(solve([1, -1], 2), false)
})

// Oracle: breadth-first search over every array reachable by pair flips.
function oracle(nums, k) {
  let frontier = [nums.join()]
  const seen = new Set(frontier)
  for (let moves = 0; moves <= k; moves++) {
    const next = []
    for (const key of frontier) {
      const arr = key.split(',').map(Number)
      if (arr.every(v => v === arr[0])) return true
      for (let i = 0; i + 1 < arr.length; i++) {
        const copy = [...arr]
        copy[i] *= -1
        copy[i + 1] *= -1
        const text = copy.join()
        if (!seen.has(text)) { seen.add(text); next.push(text) }
      }
    }
    frontier = next
  }
  return false
}

test('3576 exhaustive small arrays match a search oracle', () => {
  for (let n = 1; n <= 9; n++) {
    for (let mask = 0; mask < 1 << n; mask++) {
      const nums = Array.from({ length: n }, (_, i) => (mask >> i & 1 ? -1 : 1))
      for (let k = 1; k <= n; k++) assert.equal(solve(nums, k), oracle(nums, k), `${nums} k=${k}`)
    }
  }
})

test('3576 parser enforces values and the k range', () => {
  assert.deepEqual(parseInput('{"nums":[1,-1],"k":2}'), { nums: [1, -1], k: 2 })
  assert.throws(() => parseInput('{"nums":[0,1],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,-1],"k":0}'))
  assert.throws(() => parseInput('{"nums":[1,-1],"k":3}'))
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
})

test('3576 frames replay the flips', () => {
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  for (const [nums, k] of [[[-1, 1, 1, 1, -1, 1], 3], [[1, -1, 1, 1], 4], [[-1], 1], [[1, 1], 1]]) {
    const { frames, result } = buildTrace({ nums, k })
    let prev = null
    for (const f of frames) {
      assert.ok(ids.has(f.phase))
      assert.ok(f.message.length > 0)
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(pyLines[f.pythonLine - 1]?.trim(), `python line ${f.pythonLine}`)
      if (f.phase === 'flip') {
        const [a, b] = f.pair
        assert.equal(b, a + 1)
        assert.equal(f.arr[a], f.target)
        assert.equal(f.arr[a], -prev.arr[a])
        assert.equal(f.arr[b], -prev.arr[b])
        assert.equal(f.flips, prev.flips + 1)
      }
      prev = f
    }
    assert.equal(frames.at(-1).phase, 'done')
    assert.equal(frames.at(-1).result, result)
  }
  const { frames } = buildTrace({ nums: [-1, 1, 1, 1, -1, 1], k: 3 })
  assert.deepEqual(frames.at(-1).attempts.map(a => [a.target, a.flips, a.ok]), [[1, 4, false], [-1, 3, true]])
})
