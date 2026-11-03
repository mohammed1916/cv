import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (intervals, k) => buildTrace({ intervals, k }).result

test('3323 worked examples', () => {
  assert.equal(solve([[1, 3], [2, 5], [8, 10], [15, 18]], 3), 2)
  assert.equal(solve([[0, 2], [4, 5], [9, 11], [12, 12], [20, 21]], 4), 4)
})

test('3323 shared endpoints join groups and a single interval stays one group', () => {
  assert.equal(solve([[1, 2], [2, 3]], 0), 1)
  assert.equal(solve([[5, 5]], 0), 1)
})

test('3323 rejects malformed input', () => {
  assert.throws(() => parseInput('{"intervals":[[3,1]],"k":2}'))
  assert.throws(() => parseInput('{"intervals":[[1,2]],"k":-1}'))
})

// Brute oracle: try every integer insertion [s, s + len] with len <= k and count groups directly.
function groups(list) {
  const ordered = [...list].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  let count = 0
  let end = -Infinity
  for (const [s, e] of ordered) {
    if (count === 0 || s > end) { count += 1; end = e } else end = Math.max(end, e)
  }
  return count
}
function oracle(intervals, k) {
  const lo = Math.min(...intervals.map(p => p[0])) - k - 1
  const hi = Math.max(...intervals.map(p => p[1])) + 1
  let best = Infinity
  for (let s = lo; s <= hi; s += 1) {
    for (let len = 0; len <= k; len += 1) best = Math.min(best, groups([...intervals, [s, s + len]]))
  }
  return best
}

test('3323 random inputs match a brute-force insertion oracle', () => {
  let seed = 3323
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t += 1) {
    const count = 1 + rnd(6)
    const intervals = Array.from({ length: count }, () => { const s = rnd(16); return [s, s + rnd(4)] })
    const k = rnd(5)
    assert.equal(solve(intervals, k), oracle(intervals, k), JSON.stringify({ intervals, k }))
  }
})

test('3323 frames keep valid pseudocode and python lines and end with the result', () => {
  const run = buildTrace(parseInput('{"intervals":[[1,3],[2,5],[8,10],[15,18]],"k":3}'))
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= 15)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= 17)
    assert.ok(frame.components.every(([s, e]) => s <= e))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).groups, run.result)
})
