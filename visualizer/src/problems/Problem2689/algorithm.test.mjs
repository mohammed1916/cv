import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (k, root) => buildTrace({ k, root }).result
const leaf = text => ({ len: text.length, text })
const join = (a, b) => ({ len: a.len + b.len, left: a, right: b })
const expand = n => (n.text !== undefined ? n.text : expand(n.left) + expand(n.right))

test('2689 worked presets', () => {
  const tree = join(join(leaf('ca'), leaf('ts')), join(leaf('e'), leaf('dog')))
  assert.equal(solve(5, tree), 'e')
  assert.equal(solve(3, leaf('run')), 'n')
  const spine = join(leaf('x'), join(leaf('yz'), leaf('abc')))
  assert.equal(solve(6, spine), 'c')
})

test('2689 edge positions at both ends and at the split', () => {
  const tree = join(leaf('ab'), leaf('cd'))
  assert.equal(solve(1, tree), 'a')
  assert.equal(solve(2, tree), 'b')
  assert.equal(solve(3, tree), 'c')
  assert.equal(solve(4, tree), 'd')
})

test('2689 validates lengths, letters and bounds', () => {
  assert.throws(() => parseInput('{"k":1,"root":{"len":3,"text":"ab"}}'))
  assert.throws(() => parseInput('{"k":1,"root":{"len":3,"left":{"len":1,"text":"a"},"right":{"len":1,"text":"b"}}}'))
  assert.throws(() => parseInput('{"k":0,"root":{"len":1,"text":"a"}}'))
  assert.throws(() => parseInput('{"k":2,"root":{"len":1,"text":"a"}}'))
  assert.throws(() => parseInput('{"k":1,"root":{"len":1,"text":"A"}}'))
})

test('2689 frames reference real pseudocode and python lines', () => {
  const { frames } = buildTrace({ k: 6, root: join(leaf('x'), join(leaf('yz'), leaf('abc'))) })
  const pyLines = python.trim().split('\n').length
  assert.ok(frames.length > 2)
  for (const f of frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.ok(f.index >= 1)
    assert.equal(typeof f.message, 'string')
  }
  assert.equal(frames.at(-1).phase, 'done')
})

// Independent oracle: expand the whole string and index it. The trace must never need this.
test('2689 random ropes match full expansion', () => {
  let seed = 2689
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const build = depth => {
    if (depth === 0 || rnd(3) === 0) {
      const len = 1 + rnd(4)
      return leaf(Array.from({ length: len }, () => 'abcxyz'[rnd(6)]).join(''))
    }
    return join(build(depth - 1), build(depth - 1))
  }
  for (let t = 0; t < 200; t++) {
    const root = build(3)
    const text = expand(root)
    if (text.length > 40) continue
    const k = 1 + rnd(text.length)
    assert.equal(solve(k, root), text[k - 1], JSON.stringify({ k, root }))
  }
})
