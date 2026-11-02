import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (root, p, q) => buildTrace({ root, p, q }).result
const codeLines = code.length
const pyLines = python.split('\n').length

function pathTo(values, target) {
  const path = []
  const walk = (i, trail) => {
    if (i >= values.length || values[i] === null) return false
    const next = [...trail, values[i]]
    if (values[i] === target) { path.push(...next); return true }
    return walk(2 * i + 1, next) || walk(2 * i + 2, next)
  }
  walk(0, [])
  return path
}

function oracle(root, p, q) {
  const a = pathTo(root, p)
  const b = pathTo(root, q)
  if (!a.length || !b.length) return null
  let last = null
  for (let i = 0; i < Math.min(a.length, b.length) && a[i] === b[i]; i++) last = a[i]
  return last
}

test('1644 worked examples', () => {
  const root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]
  assert.equal(solve(root, 5, 1), 3)
  assert.equal(solve(root, 5, 4), 5)
  assert.equal(solve(root, 7, 4), 2)
})

test('1644 returns null when either node is absent', () => {
  const root = [3, 5, 1, 6, 2, 0, 8]
  assert.equal(solve(root, 5, 99), null)
  assert.equal(solve(root, 99, 1), null)
})

test('1644 rejects malformed input', () => {
  assert.throws(() => parseInput('{"root":[1,1],"p":1,"q":1}'))
  assert.throws(() => parseInput('{"root":[null,1],"p":1,"q":1}'))
  assert.throws(() => parseInput('{"root":[1],"p":"1","q":1}'))
})

test('1644 frames point at real pseudocode and python lines', () => {
  const run = buildTrace({ root: [3, 5, 1, 6, 2, 0, 8], p: 6, q: 2 })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= codeLines)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

test('1644 random trees match a path-intersection oracle', () => {
  let seed = 1644
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rnd(12)
    const values = []
    const pool = Array.from({ length: 20 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    let filled = 0
    const arrLen = 2 ** Math.ceil(Math.log2(size + 1)) - 1
    for (let i = 0; i < arrLen; i++) {
      const parentOk = i === 0 || (values[Math.floor((i - 1) / 2)] !== null && values[Math.floor((i - 1) / 2)] !== undefined)
      if (filled < size && parentOk && rnd(3) > 0) { values.push(pool[filled]); filled++ } else values.push(null)
    }
    if (values[0] === null) continue
    while (values.length && values[values.length - 1] === null) values.pop()
    const present = values.filter(v => v !== null)
    const p = rnd(3) === 0 ? 99 : present[rnd(present.length)]
    const q = present[rnd(present.length)]
    assert.equal(solve(values, p, q), oracle(values, p, q), JSON.stringify({ values, p, q }))
  }
})
