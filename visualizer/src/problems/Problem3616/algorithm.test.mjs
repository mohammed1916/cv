import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = ranks => buildTrace(ranks).result

test('3616 hand-checked values', () => {
  assert.equal(solve([5, 3, 4, 1, 2]), 2)
  assert.equal(solve([7, 7, 7]), 0)
  assert.equal(solve([4, 3, 2, 1]), 3)
  assert.equal(solve([1]), 0)
})

test('3616 equal ranks never replace the selection', () => {
  assert.equal(solve([9, 9, 9, 8, 8, 8, 8]), 1)
})

test('3616 rejects empty and invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]'))
})

test('3616 frames carry valid lines and phases', () => {
  const trace = buildTrace([5, 3, 4, 1, 2])
  const phaseIds = new Set(phases.map(p => p.id))
  for (const frame of trace.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
    assert.ok(phaseIds.has(frame.phase))
    assert.equal(typeof frame.message, 'string')
    assert.ok(frame.count >= 0)
  }
})

// Oracle: a replacement happens exactly when the arrival is a new strict prefix minimum.
test('3616 matches a prefix-minimum oracle on random lists', () => {
  let seed = 3616
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const ranks = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(9))
    let expected = 0
    for (let i = 1; i < ranks.length; i++) if (ranks[i] < Math.min(...ranks.slice(0, i))) expected++
    assert.equal(solve(ranks), expected, JSON.stringify(ranks))
  }
})

// Equal ranks identify different students: ties must preserve the first selection.
test('3616 retains selected student identity across ties and immutable frames', () => {
  const trace = buildTrace([7, 7, 4, 4, 9])
  const resolved = trace.frames.filter(f => ['setup', 'keep', 'replace', 'done'].includes(f.phase))
  assert.deepEqual(resolved.map(f => f.selectedIndex), [0, 0, 2, 2, 2, 2])
  assert.ok(buildTrace([7, 7, 7]).frames.every(f => f.selectedIndex === 0))
})
