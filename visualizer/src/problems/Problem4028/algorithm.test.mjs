import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('4028 hand-checked strings', () => {
  assert.equal(solve('abc'), 2)
  assert.equal(solve('ab'), 1)
  assert.equal(solve('xyz'), 2)
  assert.equal(solve('a'), 0)
  assert.equal(solve('aba'), 0)
})

test('4028 rejects bad input', () => {
  assert.throws(() => parseInput('{"s":""}'))
  assert.throws(() => parseInput('{"s":"AB"}'))
})

// Oracle: breadth-first search over every string reachable by one-letter steps and left rotations.
function oracle(s) {
  const n = s.length
  const isPal = t => [...t].every((c, i) => c === t[n - 1 - i])
  const start = s
  const seen = new Map([[start, 0]])
  const queue = [start]
  for (let i = 0; i < queue.length; i++) {
    const cur = queue[i]
    if (isPal(cur)) return seen.get(cur)
    const next = [cur.slice(1) + cur[0]]
    for (let p = 0; p < n; p++) {
      const code = cur.charCodeAt(p) - 97
      next.push(cur.slice(0, p) + String.fromCharCode(97 + ((code + 1) % 26)) + cur.slice(p + 1))
    }
    for (const nx of next) {
      if (!seen.has(nx)) { seen.set(nx, seen.get(cur) + 1); queue.push(nx) }
    }
  }
  return -1
}

test('4028 short strings match a breadth-first search oracle', () => {
  let seed = 4028
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 60; t++) {
    const len = 1 + rnd(3)
    const s = Array.from({ length: len }, () => String.fromCharCode(97 + rnd(26))).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})

test('4028 frames end at the answer', () => {
  const run = buildTrace({ s: 'kitten' })
  assert.equal(run.frames.at(-1).cost, run.result)
  assert.equal(run.frames.at(-1).phase, 'done')
})
