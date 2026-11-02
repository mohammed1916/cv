import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = schedules => buildTrace(schedules).result
const pyLines = python.split('\n').length

test('759 worked examples', () => {
  assert.deepEqual(solve([[[1, 2], [5, 6]], [[1, 3]], [[4, 10]]]), [[3, 4]])
  assert.deepEqual(solve([[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]]), [[5, 6], [7, 9]])
})

test('759 touching intervals leave no gap and unbounded time is never returned', () => {
  assert.deepEqual(solve([[[1, 2]], [[2, 3]]]), [])
  assert.deepEqual(solve([[[5, 6]]]), [])
  assert.deepEqual(solve([[[0, 1]], [[4, 5]]]), [[1, 4]])
})

test('759 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace(parseInput('[[[1,2],[5,6]],[[1,3]],[[4,10]]]'))
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 0)
  }
})

test('759 rejects unsorted or overlapping schedules', () => {
  assert.throws(() => parseInput('[[[3,4],[1,2]]]'))
  assert.throws(() => parseInput('[[[1,3],[2,4]]]'))
  assert.throws(() => parseInput('[[[1,1]]]'))
})

// Oracle: mark every unit cell [t, t+1) covered by a busy interval; a free gap is a maximal run of
// uncovered cells that lies strictly between the first and last busy cell.
function oracle(schedules) {
  const cover = new Array(60).fill(false)
  for (const busy of schedules) for (const [a, b] of busy) for (let t = a; t < b; t++) cover[t] = true
  const cells = cover.map((c, t) => (c ? t : -1)).filter(t => t >= 0)
  if (cells.length === 0) return []
  const first = cells[0], last = cells[cells.length - 1]
  const gaps = []
  let t = first
  while (t < last) {
    if (!cover[t]) {
      const start = t
      while (!cover[t]) t++
      gaps.push([start, t])
    } else t++
  }
  return gaps
}

test('759 random schedules match a unit-cell oracle', () => {
  let seed = 759
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 300; trial++) {
    const schedules = Array.from({ length: 1 + rnd(4) }, () => {
      const busy = []
      let cursor = rnd(10)
      for (let k = rnd(4); k > 0 && cursor < 45; k--) {
        const start = cursor + rnd(6)
        const end = start + 1 + rnd(5)
        if (end > 50) break
        busy.push([start, end])
        cursor = end
      }
      return busy
    })
    assert.deepEqual(solve(schedules), oracle(schedules), JSON.stringify(schedules))
  }
})
