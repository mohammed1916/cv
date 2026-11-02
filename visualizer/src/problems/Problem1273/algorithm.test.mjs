import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (parent, value) => buildTrace({ parent, value }).result

function checkFrames(run) {
  const pyLines = python.split('\n')
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && pyLines[frame.pythonLine - 1].trim().length > 0)
    assert.ok(frame.message.length > 0)
  }
}

test('1273 worked examples', () => {
  assert.equal(solve([-1, 0, 0, 1, 1], [4, 1, -1, 0, 2]), 4)
  assert.equal(solve([-1, 0, 1, 1], [7, 2, -2, 0]), 1)
  assert.equal(solve([-1, 0, 0], [1, 2, 3]), 3)
})

test('1273 edge cases: a zero-sum root deletes the whole tree', () => {
  assert.equal(solve([-1], [0]), 0)
  assert.equal(solve([-1, 0], [1, -1]), 0)
  checkFrames(buildTrace({ parent: [-1, 0, 0, 1, 1], value: [4, 1, -1, 0, 2] }))
})

// Oracle: a node survives when no ancestor-or-self has a zero subtree sum.
function oracle(parent, value) {
  const n = parent.length
  const sumOf = v => {
    let total = value[v]
    for (let c = 0; c < n; c++) if (parent[c] === v) total += sumOf(c)
    return total
  }
  let count = 0
  for (let v = 0; v < n; v++) {
    let ok = true
    for (let u = v; u !== -1; u = parent[u]) if (sumOf(u) === 0) { ok = false; break }
    if (ok) count++
  }
  return count
}

test('1273 random trees match an ancestor-walk oracle', () => {
  let seed = 1273
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let trial = 0; trial < 400; trial++) {
    const n = 1 + rand(10)
    const parent = [-1]
    for (let v = 1; v < n; v++) parent.push(rand(v))
    const value = Array.from({ length: n }, () => rand(7) - 3)
    assert.equal(solve(parent, value), oracle(parent, value), JSON.stringify({ parent, value }))
  }
})

test('1273 rejects a cycle and out-of-range values', () => {
  assert.throws(() => parseInput('{"parent":[-1,2,1],"value":[0,0,0]}'))
  assert.throws(() => parseInput('{"parent":[-1,0],"value":[0,50]}'))
  assert.throws(() => parseInput('{"parent":[0,0],"value":[0,0]}'))
})
