import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const run = input => buildTrace(parseInput(JSON.stringify(input)))

function checkFrames(trace) {
  const pyLines = python.split('\n')
  for (const frame of trace.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && pyLines[frame.pythonLine - 1].trim().length > 0)
    assert.ok(frame.message.length > 0)
  }
}

// Canonical labelling by a fixed walk (left, right, random). Two graphs are equal if these lists match.
function canon({ val, left, right, random }) {
  const label = new Map()
  const order = []
  const visit = v => {
    if (v === -1 || label.has(v)) return
    label.set(v, order.length)
    order.push(v)
    visit(left[v])
    visit(right[v])
    visit(random[v])
  }
  visit(0)
  const lab = x => (x === -1 ? -1 : label.get(x))
  return order.map(v => [val[v], lab(left[v]), lab(right[v]), lab(random[v])])
}

test('1485 worked example: copies keep left, right and random pointers', () => {
  const input = { val: [1, 2, 3], left: [1, -1, -1], right: [2, -1, -1], random: [2, 0, -1] }
  const trace = run(input)
  assert.deepEqual(trace.result, { val: [1, 2, 3], left: [1, -1, -1], right: [2, -1, -1], random: [2, 0, -1] })
  checkFrames(trace)
})

test('1485 edge cases: a single node with a random pointer to itself', () => {
  const trace = run({ val: [7], left: [-1], right: [-1], random: [0] })
  assert.deepEqual(trace.result, { val: [7], left: [-1], right: [-1], random: [0] })
})

test('1485 rejects a graph that is not a tree rooted at node 0', () => {
  assert.throws(() => parseInput('{"val":[1,2],"left":[1,-1],"right":[1,-1],"random":[-1,-1]}'))
  assert.throws(() => parseInput('{"val":[1,2],"left":[-1,-1],"right":[-1,-1],"random":[-1,-1]}'))
  assert.throws(() => parseInput('{"val":[1,2],"left":[1,0],"right":[-1,-1],"random":[-1,-1]}'))
})

test('1485 random trees with random pointers are cloned into an isomorphic graph', () => {
  let seed = 1485
  const rand = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >>> 16) % k }
  for (let trial = 0; trial < 300; trial++) {
    const n = 1 + rand(10)
    const left = Array(n).fill(-1)
    const right = Array(n).fill(-1)
    for (let v = 1; v < n; v++) {
      for (;;) {
        const p = rand(v)
        if (rand(2) === 0 && left[p] === -1) { left[p] = v; break }
        if (right[p] === -1) { right[p] = v; break }
        if (left[p] === -1) { left[p] = v; break }
      }
    }
    const val = Array.from({ length: n }, () => rand(10))
    const random = Array.from({ length: n }, () => rand(n + 1) - 1)
    const input = { val, left, right, random }
    const trace = run(input)
    assert.equal(trace.result.val.length, n)
    assert.deepEqual(canon(trace.result), canon(input), JSON.stringify(input))
  }
})
