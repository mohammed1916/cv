import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, nextValue } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace({ nums1, nums2 }).result

test('3269 next value by parity', () => {
  assert.equal(nextValue(0, 0), 2)
  assert.equal(nextValue(0, 1), 1)
  assert.equal(nextValue(3, 0), 4)
  assert.equal(nextValue(3, 1), 5)
  assert.equal(nextValue(4, 0), 6)
})

test('3269 hand-computed cases', () => {
  // [2, 4, 5]
  assert.equal(solve([], [0, 0, 1]), 5)
  // evens 2, 4, 6, 8 shared between both arrays
  assert.equal(solve([0, 0], [0, 0]), 8)
  // nums1 = [1], nums2 = [2]
  assert.equal(solve([1], [0]), 2)
  // nums1 = [1, 3, 4], nums2 = [2, 5]
  assert.equal(solve([1, 1, 0], [0, 1]), 5)
  assert.equal(solve([], [1]), 1)
  assert.equal(solve([], [0]), 2)
  // two odds compete for 1, then 3
  assert.equal(solve([1], [1]), 3)
})

// Oracle: for growing limits, search every assignment of distinct integers directly.
function feasible(a, b, limit) {
  const used = new Set()
  const fill = (list, index, floor, next) => {
    if (index === list.length) return next()
    for (let value = floor + 1; value <= limit; value++) {
      if (value % 2 !== list[index] % 2 || used.has(value)) continue
      used.add(value)
      if (fill(list, index + 1, value, next)) return true
      used.delete(value)
    }
    return false
  }
  return fill(a, 0, 0, () => fill(b, 0, 0, () => true))
}
function oracle(a, b) {
  for (let limit = 1; ; limit++) if (feasible(a, b, limit)) return limit
}

test('3269 agrees with exhaustive search on small arrays', () => {
  const lists = []
  for (let length = 0; length <= 3; length++) {
    for (let mask = 0; mask < 1 << length; mask++) {
      lists.push(Array.from({ length }, (_, bit) => (mask >> bit) & 1))
    }
  }
  for (const a of lists) for (const b of lists) {
    if (b.length === 0) continue
    assert.equal(solve(a, b), oracle(a, b), JSON.stringify({ a, b }))
  }
})

test('3269 the shown placement is valid and reaches the answer', () => {
  const cases = [[[1, 1, 0], [0, 1]], [[0, 1, 0, 1], [1, 1, 0]], [[0, 0, 1], [0, 1, 1, 0]], [[], [1, 0]]]
  for (const [a, b] of cases) {
    const { frames, result } = buildTrace({ nums1: a, nums2: b })
    const { placement } = frames.at(-1)
    const all = [...placement.a, ...placement.b]
    assert.equal(new Set(all).size, all.length)
    assert.equal(Math.max(...all), result)
    placement.a.forEach((value, i) => { assert.equal(value % 2, a[i]); if (i) assert.ok(value > placement.a[i - 1]) })
    placement.b.forEach((value, i) => { assert.equal(value % 2, b[i]); if (i) assert.ok(value > placement.b[i - 1]) })
  }
})

test('3269 parser', () => {
  assert.doesNotThrow(() => parseInput('{"nums1":[],"nums2":[1]}'))
  assert.throws(() => parseInput('{"nums1":[],"nums2":[]}'))
  assert.throws(() => parseInput('{"nums1":[2],"nums2":[1]}'))
  assert.throws(() => parseInput('{"nums1":[0,0,0,0,0,0,0,0,0],"nums2":[1]}'))
  assert.throws(() => parseInput('[0]'))
})

test('3269 frames', () => {
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  const { frames } = buildTrace({ nums1: [1, 0], nums2: [0, 1, 1] })
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(pyLines[frame.pythonLine - 1]?.trim())
    assert.notEqual(frame.values[frame.target[0]][frame.target[1]], null)
    for (const source of frame.sources) assert.notEqual(frame.values[source.cell[0]][source.cell[1]], null)
    assert.ok(frame.message)
  }
  // 12 cells: start + 2 + 3 edge frames + 6 interior + final
  assert.equal(frames.length, 1 + 2 + 3 + 6 + 1)
  const fill = frames.find(f => f.phase === 'fill')
  assert.match(pyLines[fill.pythonLine - 1], /min\(from_top, from_left\)/)
  assert.equal(fill.sources.filter(s => s.chosen).length, 1)
  assert.match(pyLines[frames.at(-1).pythonLine - 1], /return f\[m\]\[n\]/)
})
