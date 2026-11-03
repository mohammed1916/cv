import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3555 windows that are sorted, partly sorted and reversed', () => {
  assert.deepEqual(solve([1, 3, 2, 4, 5], 3), [2, 2, 0])
  assert.deepEqual(solve([3, 2, 1], 3), [3])
  assert.deepEqual(solve([1, 2, 3], 2), [0, 0])
})

test('3555 rejects bad window lengths and values', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
  assert.throws(() => parseInput('{"nums":[1,0],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
})

// Independent brute force on small windows: try every contiguous segment and keep the shortest one whose sort fixes the window.
function brute(nums, k) {
  const out = []
  for (let s = 0; s + k <= nums.length; s++) {
    const w = nums.slice(s, s + k)
    const sorted = [...w].sort((x, y) => x - y)
    if (w.every((x, i) => x === sorted[i])) { out.push(0); continue }
    let best = Infinity
    for (let l = 0; l < k; l++) {
      for (let r = l; r < k; r++) {
        const fixed = [...w.slice(0, l), ...[...w.slice(l, r + 1)].sort((x, y) => x - y), ...w.slice(r + 1)]
        if (fixed.every((x, i) => x <= (fixed[i + 1] ?? Infinity))) best = Math.min(best, r - l + 1)
      }
    }
    out.push(best)
  }
  return out
}

test('3555 random lists match the brute-force segment search', () => {
  let seed = 3555
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(9))
    const k = 1 + rnd(nums.length)
    assert.deepEqual(solve(nums, k), brute(nums, k), JSON.stringify({ nums, k }))
  }
})

test('3555 frames keep their pseudocode and python lines in range', () => {
  const run = buildTrace(parseInput('{"nums":[2,1,3,5,4],"k":3}'))
  for (const f of run.frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= 10)
    assert.ok(f.pythonLine >= 1)
  }
  assert.equal(run.result.length, 3)
  assert.equal(run.frames.at(-1).phase, 'done')
})
