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

// Nested form of a flat {val, children} graph, rooted at node 0.
function nested({ val, children }, v = 0) {
  return [val[v], ...children[v].map(c => nested({ val, children }, c))]
}

test('1490 worked example keeps values and child order', () => {
  const input = { val: [1, 3, 2, 4, 5, 6], children: [[1, 2, 3], [4, 5], [], [], [], []] }
  const trace = run(input)
  // Copies are numbered in preorder: original nodes 0, 1, 4, 5, 2, 3 become copies 0 to 5.
  assert.deepEqual(trace.result, { val: [1, 3, 5, 6, 2, 4], children: [[1, 4, 5], [2, 3], [], [], [], []] })
  assert.deepEqual(nested(trace.result), nested(input))
  checkFrames(trace)
})

test('1490 edge cases: a single node and a null root', () => {
  assert.deepEqual(run({ val: [5], children: [[]] }).result, { val: [5], children: [[]] })
  assert.equal(run({ val: [], children: [] }).result, null)
})

test('1490 child order matters', () => {
  const trace = run({ val: [0, 1, 2], children: [[2, 1], [], []] })
  // Creation is preorder, so child 2 is cloned first and gets copy index 1.
  assert.deepEqual(trace.result, { val: [0, 2, 1], children: [[1, 2], [], []] })
})

test('1490 rejects a shared child or a missing root link', () => {
  assert.throws(() => parseInput('{"val":[0,1,2],"children":[[1,2],[2],[]]}'))
  assert.throws(() => parseInput('{"val":[0,1],"children":[[],[]]}'))
})

test('1490 random trees clone to the same nested shape', () => {
  let seed = 1490
  const rand = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >>> 16) % k }
  for (let trial = 0; trial < 300; trial++) {
    const n = 1 + rand(10)
    const children = Array.from({ length: n }, () => [])
    for (let v = 1; v < n; v++) children[rand(v)].push(v)
    const val = Array.from({ length: n }, () => rand(10))
    const input = { val, children }
    const out = run(input).result
    assert.equal(out.val.length, n)
    assert.deepEqual(nested(out), nested(input), JSON.stringify(input))
  }
})
