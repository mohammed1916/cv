import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2773 authored presets with known heights', () => {
  assert.equal(solve('{"v":8,"l":{"v":3,"l":{"v":1},"r":{"v":6,"l":{"v":4}}},"r":{"v":9}}'), 4)
  assert.equal(solve('{"v":5}'), 1)
  assert.equal(solve('{"v":2,"r":{"v":7,"r":{"v":1,"r":{"v":4}}}}'), 4)
  assert.equal(solve('{"v":10,"l":{"v":5},"r":{"v":15,"l":{"v":12},"r":{"v":20}}}'), 3)
})

test('2773 an empty tree is not a valid preset input', () => {
  assert.throws(() => parseInput('null'))
})

test('2773 input validation', () => {
  assert.throws(() => parseInput('[1]'))
  assert.throws(() => parseInput('{"v":0}'))
  assert.throws(() => parseInput('{"v":"3"}'))
  const chain = { v: 1 }
  let cursor = chain
  for (let k = 2; k <= 13; k += 1) { cursor.r = { v: k }; cursor = cursor.r }
  assert.throws(() => parseInput(JSON.stringify(chain)))
})

// Independent oracle: plain recursion over the nested input, counting nodes on the longest path.
function oracle(spec) {
  if (spec === null) return 0
  return 1 + Math.max(oracle(spec.l ?? null), oracle(spec.r ?? null))
}

test('2773 random trees match a recursive oracle', () => {
  let seed = 2773
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const build = budget => {
    if (budget <= 0) return null
    const left = rnd(budget)
    const node = { v: 1 + rnd(99) }
    const l = build(left)
    const r = build(budget - 1 - left)
    if (l) node.l = l
    if (r) node.r = r
    return node
  }
  for (let t = 0; t < 300; t++) {
    const spec = build(1 + rnd(12))
    assert.equal(solve(JSON.stringify(spec)), oracle(spec), JSON.stringify(spec))
  }
})

test('2773 frame invariants hold for every preset', () => {
  const presets = [
    '{"v":8,"l":{"v":3,"l":{"v":1},"r":{"v":6,"l":{"v":4}}},"r":{"v":9}}',
    '{"v":5}',
    '{"v":2,"r":{"v":7,"r":{"v":1,"r":{"v":4}}}}',
  ]
  for (const text of presets) {
    const run = buildTrace(parseInput(text))
    assert.equal(run.frames[run.frames.length - 1].ok, true)
    for (const f of run.frames) {
      assert.ok(phases.some(p => p.id === f.phase), f.phase)
      assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
      assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= python.trim().split('\n').length)
      assert.ok(Array.isArray(f.pending) && Array.isArray(f.visited) && Number.isInteger(f.best))
      assert.ok(f.message.length > 0)
    }
  }
})
