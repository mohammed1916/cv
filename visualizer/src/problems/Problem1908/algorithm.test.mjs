import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = heaps => buildTrace(heaps).result
const codeLines = code.length
const pyLines = python.split('\n').length

test('1908 worked examples', () => {
  assert.equal(solve([1, 2, 3]), false)
  assert.equal(solve([1, 2]), true)
  assert.equal(solve([0]), false)
  assert.equal(solve([7]), true)
  assert.equal(solve([4, 4, 0, 6]), true)
})

test('1908 rejects heaps outside the visualization cap', () => {
  assert.throws(() => parseInput('[16]'))
  assert.throws(() => parseInput('[]'))
})

test('1908 frames point at real pseudocode and python lines', () => {
  const run = buildTrace([3, 5])
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

// Oracle: full game-tree search over sorted heap multisets (small heaps only).
function oracle(heaps) {
  const memo = new Map()
  const wins = state => {
    const key = state.join(',')
    if (memo.has(key)) return memo.get(key)
    let winning = false
    for (let i = 0; i < state.length && !winning; i++) {
      for (let take = 1; take <= state[i] && !winning; take++) {
        const next = state.slice()
        next[i] -= take
        if (!wins(next.slice().sort((a, b) => a - b))) winning = true
      }
    }
    memo.set(key, winning)
    return winning
  }
  return wins(heaps.slice().sort((a, b) => a - b))
}

test('1908 small games match a full game-tree search', () => {
  let seed = 1908
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const heaps = Array.from({ length: 1 + rnd(4) }, () => rnd(5))
    assert.equal(solve(heaps), oracle(heaps), JSON.stringify(heaps))
  }
})
