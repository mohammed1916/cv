import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (vals, children) => buildTrace({ vals, children }).result

function checkFrames(trace) {
  const pyLines = python.split('\n')
  for (const frame of trace.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && pyLines[frame.pythonLine - 1].trim().length > 0)
    assert.ok(frame.message.length > 0)
  }
}

test('1506 worked examples return the index of the supplied root node', () => {
  assert.equal(solve([1, 2, 3, 4, 5], [[2, 3], [], [4, 5], [], []]), 0)
  assert.equal(solve([4, 5, 2, 6, 3, 1], [[], [], [], [], [], [4, 5, 2, 6, 3]]), 5)
  checkFrames(buildTrace({ vals: [1, 2, 3, 4, 5], children: [[2, 3], [], [4, 5], [], []] }))
})

test('1506 edge cases: a single node, and a root that is not listed first', () => {
  assert.equal(solve([9], [[]]), 0)
  assert.equal(solve([7, 3, 8], [[3, 8], [], []]), 0)
  assert.equal(solve([3, 8, 7], [[], [], [3, 8]]), 2)
})

test('1506 the answer is the node that is never a child', () => {
  let seed = 1506
  const rand = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >>> 16) % k }
  for (let trial = 0; trial < 300; trial++) {
    const n = 1 + rand(12)
    const pool = Array.from({ length: 100 }, (_, i) => i)
    for (let i = pool.length - 1; i > 0; i--) { const j = rand(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const vals = pool.slice(0, n)
    const children = vals.map(() => [])
    for (let i = 1; i < n; i++) children[rand(i)].push(vals[i])
    // Shuffle the supplied order so the root is not necessarily first.
    const order = vals.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i--) { const j = rand(i + 1); [order[i], order[j]] = [order[j], order[i]] }
    const shuffledVals = order.map(i => vals[i])
    const shuffledChildren = order.map(i => children[i])
    const rootValue = vals[0]
    assert.equal(shuffledVals[solve(shuffledVals, shuffledChildren)], rootValue, JSON.stringify({ shuffledVals, shuffledChildren }))
  }
})

test('1506 rejects two roots and a child that is not supplied', () => {
  assert.throws(() => parseInput('{"vals":[1,2],"children":[[],[]]}'))
  assert.throws(() => parseInput('{"vals":[1,2],"children":[[5],[]]}'))
  assert.throws(() => parseInput('{"vals":[1,1],"children":[[],[]]}'))
})
