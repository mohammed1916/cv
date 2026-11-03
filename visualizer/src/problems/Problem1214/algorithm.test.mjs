import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, code, python, phases } from './algorithm.js'

const CODE_LINES = new Map(code.map(entry => [entry.line, entry.text]))
const PYTHON_LINES = python.split('\n')
const PHASE_IDS = new Set(phases.map(phase => phase.id))

function solve(text) {
  return buildTrace(parseInput(text)).result
}

function assertFrameInvariants(run) {
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(PHASE_IDS.has(frame.phase), `phase ${frame.phase}`)
    assert.ok(CODE_LINES.get(frame.activeLine)?.trim(), `pseudocode line ${frame.activeLine}`)
    assert.ok(PYTHON_LINES[frame.pythonLine - 1]?.trim(), `python line ${frame.pythonLine}`)
  }
}

// Independent oracle: every value of tree 1 against every value of tree 2.
function oracle(levels1, levels2, target) {
  const a = levels1.filter(v => v !== null)
  const b = levels2.filter(v => v !== null)
  return a.some(x => b.some(y => x + y === target))
}

// Balanced BST in level order (heap positions, nulls included) from sorted distinct values.
function bstLevels(sorted) {
  const out = []
  function fill(index, lo, hi) {
    if (lo > hi) return
    const mid = (lo + hi) >> 1
    out[index] = sorted[mid]
    fill(2 * index + 1, lo, mid - 1)
    fill(2 * index + 2, mid + 1, hi)
  }
  fill(0, 0, sorted.length - 1)
  for (let i = 0; i < out.length; i += 1) if (out[i] === undefined) out[i] = null
  return out
}

test('the first example finds 5 + 6 from the two trees', () => {
  const run = buildTrace(parseInput('{"root1":[5,3,8],"root2":[2,1,6],"target":11}'))
  assert.equal(run.result, true)
  assert.deepEqual(run.pair, [5, 6])
  assertFrameInvariants(run)
})

test('the second example reports no pair when the target is too large', () => {
  const run = buildTrace(parseInput('{"root1":[5,3,8],"root2":[2,1,6],"target":20}'))
  assert.equal(run.result, false)
  assertFrameInvariants(run)
})

test('single-node trees pair only when the two values hit the target', () => {
  assert.equal(solve('{"root1":[4],"root2":[4],"target":8}'), true)
  assert.equal(solve('{"root1":[4],"root2":[4],"target":7}'), false)
})

test('nodes from the same tree are never paired with each other', () => {
  // Tree 1 holds 1 and 3 only, tree 2 holds 10. Target 4 would need 1 + 3 from the same tree.
  assert.equal(solve('{"root1":[2,1,3],"root2":[10],"target":4}'), false)
})

test('parseInput rejects invalid trees and targets', () => {
  assert.throws(() => parseInput('{"root1":[],"root2":[1],"target":2}'), /1 to 15/)
  assert.throws(() => parseInput('{"root1":[null,1],"root2":[1],"target":2}'), /root value/)
  assert.throws(() => parseInput('{"root1":[2,3,1],"root2":[1],"target":2}'), /binary search tree/)
  assert.throws(() => parseInput('{"root1":[1],"root2":[1],"target":1.5}'), /integer/)
  assert.throws(() => parseInput('{"root1":[1.5],"root2":[1],"target":2}'), /integers or null/)
})

test('the trace agrees with the brute-force oracle on random balanced trees', () => {
  let seed = 1214
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed
  }
  for (let trial = 0; trial < 300; trial += 1) {
    const pool = Array.from({ length: 41 }, (_, k) => k - 20)
    const pick = (count) => {
      const copy = pool.slice()
      const chosen = []
      while (chosen.length < count) chosen.push(copy.splice(next() % copy.length, 1)[0])
      return chosen.sort((x, y) => x - y)
    }
    const values1 = pick(1 + (next() % 6))
    const values2 = pick(1 + (next() % 6))
    const levels1 = bstLevels(values1)
    const levels2 = bstLevels(values2)
    const target = (next() % 41) - 20 + (next() % 41) - 20
    const text = JSON.stringify({ root1: levels1, root2: levels2, target })
    const run = buildTrace(parseInput(text))
    assert.equal(run.result, oracle(levels1, levels2, target), text)
    assertFrameInvariants(run)
  }
})
