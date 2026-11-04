import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const run = calls => buildTrace({ calls }).result

test('3369 hand-computed sequence', () => {
  // after adds [8,3,8,5]: total 24, mean 6; sorted 3,5,8,8 -> position 2 = 8; mode 8.
  // after removal [3,8,5]: every count 1, mode 3; sorted 3,5,8 -> position 1 = 5.
  assert.deepEqual(run([['addNumber', 8], ['addNumber', 3], ['addNumber', 8], ['addNumber', 5], ['getMean'], ['getMedian'], ['getMode'], ['removeFirstAddedNumber'], ['getMode'], ['getMedian']]),
    [null, null, null, null, 6, 8, 8, null, 3, 5])
})

test('3369 floors the mean and breaks mode ties with the smaller value', () => {
  assert.deepEqual(run([['addNumber', 2], ['addNumber', 3], ['getMean'], ['getMode'], ['getMedian']]), [null, null, 2, 2, 3])
})

test('3369 edge cases: remove to empty then refill, duplicates of the oldest', () => {
  assert.deepEqual(run([['addNumber', 7], ['removeFirstAddedNumber'], ['addNumber', 2], ['getMode']]), [null, null, null, 2])
  assert.deepEqual(run([['addNumber', 4], ['addNumber', 4], ['addNumber', 1], ['removeFirstAddedNumber'], ['getMode'], ['getMedian']]), [null, null, null, null, 1, 4])
})

test('3369 parseInput rejects bad calls', () => {
  assert.doesNotThrow(() => parseInput('{"calls":[["addNumber",1],["getMean"]]}'))
  assert.throws(() => parseInput('{"calls":[["getMean"]]}'))
  assert.throws(() => parseInput('{"calls":[["addNumber",0]]}'))
  assert.throws(() => parseInput('{"calls":[["addNumber",1],["removeFirstAddedNumber"],["getMode"]]}'))
  assert.throws(() => parseInput('{"calls":[["other"]]}'))
})

// Oracle: keep only a plain array and recompute every statistic from scratch.
function oracle(calls) {
  const list = []
  return calls.map(([name, value]) => {
    if (name === 'addNumber') { list.push(value); return null }
    if (name === 'removeFirstAddedNumber') { list.shift(); return null }
    if (name === 'getMean') return Math.floor(list.reduce((a, b) => a + b, 0) / list.length)
    const s = [...list].sort((a, b) => a - b)
    if (name === 'getMedian') return s[s.length >> 1]
    let best = s[0], bestCount = 0
    for (const v of s) {
      const c = s.filter(x => x === v).length
      if (c > bestCount) { best = v; bestCount = c }
    }
    return best
  })
}

test('3369 random call sequences match the recompute oracle', () => {
  let seed = 3369
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const calls = []
    let size = 0
    for (let i = 0; i < 40; i++) {
      const kind = size === 0 ? 0 : rnd(5)
      if (kind === 0) { calls.push(['addNumber', 1 + rnd(6)]); size++ }
      else if (kind === 1) { calls.push(['removeFirstAddedNumber']); size-- }
      else calls.push([['getMean', 'getMedian', 'getMode'][kind - 2]])
    }
    assert.deepEqual(run(calls), oracle(calls))
  }
})

test('3369 frames: structures stay consistent and lines are real', () => {
  const { frames } = buildTrace({ calls: [['addNumber', 5], ['addNumber', 5], ['removeFirstAddedNumber'], ['getMedian']] })
  const end = frames.at(-1)
  assert.deepEqual(end.queue, [5])
  assert.deepEqual(end.sorted, [5])
  assert.deepEqual(end.ranked, [{ value: 5, count: 1 }])
  assert.equal(end.total, 5)
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  for (const f of frames) {
    assert.ok(ids.has(f.phase) && f.message)
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(pyLines[f.pythonLine - 1]?.trim())
  }
})
