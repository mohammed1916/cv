import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, python } from './algorithm.js'

const solve = (courses, relations) => buildTrace({ courses, relations }).result

// Oracle: longest chain of prerequisites ending at each course, found by memoised depth search.
// Any cycle makes the answer -1.
function oracle(n, rels) {
  const pre = Array.from({ length: n + 1 }, () => [])
  for (const [b, a] of rels) pre[a].push(b)
  const memo = new Map()
  const state = new Map()
  let cyclic = false
  const depth = c => {
    if (state.get(c) === 'open') { cyclic = true; return 0 }
    if (memo.has(c)) return memo.get(c)
    state.set(c, 'open')
    let best = 0
    for (const p of pre[c]) best = Math.max(best, depth(p))
    state.set(c, 'closed')
    memo.set(c, best + 1)
    return best + 1
  }
  let answer = 0
  for (let c = 1; c <= n; c++) answer = Math.max(answer, depth(c))
  return cyclic ? -1 : answer
}

test('1136 hand-checked cases', () => {
  assert.equal(solve(3, [[1, 2], [2, 3]]), 3)
  assert.equal(solve(4, [[1, 2], [1, 3], [2, 4], [3, 4]]), 3)
  assert.equal(solve(3, []), 1)
  assert.equal(solve(2, [[1, 2], [2, 1]]), -1)
})

test('1136 layered sort matches the longest-chain oracle on seeded DAGs and cyclic graphs', () => {
  let seed = 1136
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const rels = []
    const count = rnd(10)
    for (let i = 0; i < count && n > 1; i++) {
      const a = 1 + rnd(n)
      let b = 1 + rnd(n)
      if (b === a) b = (a % n) + 1
      rels.push([a, b])
    }
    assert.equal(solve(n, rels), oracle(n, rels), JSON.stringify({ n, rels }))
  }
})

test('1136 frames carry phase, line, message and snapshot', () => {
  const { frames } = buildTrace({ courses: 4, relations: [[1, 2], [2, 3]] })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.equal(typeof frame.activeLine, 'number')
    assert.equal(typeof frame.message, 'string')
    assert.equal(typeof frame.snapshot, 'object')
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length)
  }
  assert.equal(frames.at(-1).phase, 'done')
})

test('1136 parser rejects bad input', () => {
  assert.throws(() => parseInput('{"courses":2}'))
  assert.throws(() => parseInput({ courses: 2, relations: [[1, 3]] }))
  assert.throws(() => parseInput({ courses: 2, relations: [[1]] }))
  assert.throws(() => parseInput({ courses: 0, relations: [] }))
})
