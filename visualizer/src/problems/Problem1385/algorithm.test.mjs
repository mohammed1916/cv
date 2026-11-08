
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildTrace,
  parseInput,
  code,
  phases,
  python,
  pythonLineMap
} from './algorithm.js'

const solve = (arr1, arr2, d) =>
  buildTrace(
    parseInput(JSON.stringify({ arr1, arr2, d }))
  ).result

function brute(arr1, arr2, d) {
  return arr1.filter(a =>
    arr2.every(b => Math.abs(a - b) > d)
  ).length
}

test('hand-checked examples', () => {
  assert.equal(solve([6, 2, 20], [1, 30], 3), 2)
  assert.equal(solve([4, 5, 8], [10, 9, 1, 8], 2), 2)
  assert.equal(solve([1, 4, 9], [2, 8], 1), 1)
  assert.equal(solve([-5, 0, 7], [-4, 3], 2), 2)
})

test('strict boundary conditions', () => {
  assert.equal(solve([1], [1], 0), 0)
  assert.equal(solve([1], [3], 1), 1)
  assert.equal(solve([1], [3], 2), 0)
  assert.equal(solve([1], [4], 2), 1)
  assert.equal(solve([1], [3], 3), 0)
})

test('duplicate values are counted by index', () => {
  assert.equal(solve([10, 10, 10], [1], 2), 3)
  assert.equal(solve([1, 1, 1], [1], 0), 0)
})

test('all accepted and all rejected', () => {
  assert.equal(solve([20, 30], [0, 1], 2), 2)
  assert.equal(solve([1, 2], [1, 2], 1), 0)
})

test('early rejection stops additional comparisons', () => {
  const run = buildTrace({
    arr1: [5],
    arr2: [5, 10, 20],
    d: 0
  })

  const comparisons = run.frames.filter(
    frame =>
      frame.snapshot.event === 'safe' ||
      frame.snapshot.event === 'boundary'
  )

  assert.equal(comparisons.length, 1)
  assert.equal(run.result, 0)
  assert.equal(run.frames.at(-1).snapshot.totalComparisons, 1)
})

test('every candidate receives a final verdict frame', () => {
  const run = buildTrace({
    arr1: [1, 10, 20],
    arr2: [1, 12],
    d: 2
  })

  const decisions = run.frames.filter(
    frame =>
      frame.snapshot.event === 'accepted' ||
      frame.snapshot.event === 'rejected'
  )

  assert.equal(decisions.length, 3)

  assert.deepEqual(
    decisions.map(frame => frame.snapshot.event),
    ['rejected', 'rejected', 'accepted']
  )

  assert.deepEqual(
    run.frames.at(-1).snapshot.verdict,
    [false, false, true]
  )
})

test('nearest gap is revealed incrementally', () => {
  const run = buildTrace({
    arr1: [5],
    arr2: [20, 9, 5],
    d: 0
  })

  const comparisons = run.frames.filter(
    frame =>
      frame.snapshot.event === 'safe' ||
      frame.snapshot.event === 'boundary'
  )

  assert.deepEqual(
    comparisons.map(frame => frame.snapshot.nearest[0]),
    [15, 4, 0]
  )

  assert.equal(run.frames[0].snapshot.nearest[0], null)
})

test('snapshots contain independent arrays', () => {
  const run = buildTrace({
    arr1: [1, 10],
    arr2: [1],
    d: 0
  })

  const first = run.frames[0].snapshot
  const last = run.frames.at(-1).snapshot

  assert.deepEqual(first.verdict, [null, null])
  assert.deepEqual(last.verdict, [false, true])

  assert.notStrictEqual(first.verdict, last.verdict)
  assert.notStrictEqual(first.nearest, last.nearest)
  assert.notStrictEqual(first.comparisons, last.comparisons)
})

test('running count matches accepted verdicts', () => {
  const run = buildTrace({
    arr1: [4, 5, 8],
    arr2: [10, 9, 1, 8],
    d: 2
  })

  for (const frame of run.frames) {
    const accepted = frame.snapshot.verdict.filter(
      value => value === true
    ).length

    assert.equal(frame.snapshot.count, accepted)
  }
})

test('comparison count never decreases', () => {
  const run = buildTrace({
    arr1: [1, 8, 15],
    arr2: [2, 9, 20],
    d: 1
  })

  let previous = 0

  for (const frame of run.frames) {
    const current = frame.snapshot.totalComparisons
    assert.ok(current >= previous)
    previous = current
  }
})

test('random arrays match independent oracle', () => {
  let state = 11

  const rand = max => {
    state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff
    return (state >>> 8) % max
  }

  for (let t = 0; t < 300; t++) {
    const arr1 = Array.from(
      { length: 1 + rand(12) },
      () => rand(41) - 20
    )

    const arr2 = Array.from(
      { length: 1 + rand(12) },
      () => rand(41) - 20
    )

    const d = rand(15)

    assert.equal(
      solve(arr1, arr2, d),
      brute(arr1, arr2, d),
      JSON.stringify({ arr1, arr2, d })
    )
  }
})

test('every frame contains valid metadata', () => {
  const run = buildTrace({
    arr1: [6, 2, 20],
    arr2: [1, 30],
    d: 3
  })

  const ids = phases.map(phase => phase.id)

  for (const frame of run.frames) {
    assert.ok(ids.includes(frame.phase))
    assert.ok(frame.activeLine >= 1)
    assert.ok(frame.activeLine <= code.length)
    assert.ok(frame.message.length > 10)
    assert.ok(frame.snapshot)
    assert.ok(Array.isArray(frame.snapshot.verdict))
    assert.ok(Array.isArray(frame.snapshot.nearest))
  }

  assert.equal(run.frames.at(-1).phase, 'done')
})

test('python mapping is provided', () => {
  assert.ok(python.includes('def distance_value'))
  assert.ok(python.includes('return count'))
  assert.equal(pythonLineMap[10], 11)
})

test('invalid input is rejected', () => {
  assert.throws(
    () => parseInput('{"arr1":[],"arr2":[1],"d":1}'),
    /1–50 integers/
  )

  assert.throws(
    () => parseInput('{"arr1":[1],"arr2":[1],"d":-1}'),
    /between 0 and 100/
  )

  assert.throws(
    () => parseInput('{"arr1":[101],"arr2":[1],"d":1}'),
    /1–50 integers/
  )

  assert.throws(
    () => parseInput('not json'),
    SyntaxError
  )
})
