import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const run = text => buildTrace(parseInput(text))

function serialize(nodes, id) {
  const n = nodes[id]
  if (n.left === null) return n.val
  return `(${serialize(nodes, n.left)}${n.val}${serialize(nodes, n.right)})`
}

function treeOf(text) {
  const r = run(text)
  const last = r.frames[r.frames.length - 1]
  return { ...r, shape: serialize(last.nodes, r.root) }
}

// Independent oracle: a recursive-descent parser over the same grammar.
function oracle(s) {
  const toks = s.match(/\d+|[-+*\/()]/g)
  let p = 0
  const peek = () => toks[p]
  let factor
  const term = () => {
    let [shape, value] = factor()
    while (peek() === '*' || peek() === '/') {
      const op = toks[p++]
      const [rs, rv] = factor()
      shape = `(${shape}${op}${rs})`
      value = value === null || rv === null ? null : op === '*' ? value * rv : (rv === 0 ? null : Math.trunc(value / rv))
    }
    return [shape, value]
  }
  const expr = () => {
    let [shape, value] = term()
    while (peek() === '+' || peek() === '-') {
      const op = toks[p++]
      const [rs, rv] = term()
      shape = `(${shape}${op}${rs})`
      value = value === null || rv === null ? null : op === '+' ? value + rv : value - rv
    }
    return [shape, value]
  }
  factor = () => {
    const t = toks[p++]
    if (t === '(') {
      const e = expr()
      p++
      return e
    }
    return [t, Number(t)]
  }
  return expr()
}

test('1597 the three authored presets evaluate correctly', () => {
  assert.equal(run('"12+3*4"').result, 24)
  assert.equal(run('"100/7/2"').result, 7)
  assert.equal(run('"(2+9)*(10-4)/3"').result, 22)
})

test('1597 precedence and left associativity shape the tree', () => {
  assert.equal(treeOf('"12+3*4"').shape, '(12+(3*4))')
  assert.equal(treeOf('"100/7/2"').shape, '((100/7)/2)')
  assert.equal(treeOf('"1-2-3"').shape, '((1-2)-3)')
})

test('1597 rejects malformed input', () => {
  for (const bad of ['"1+"', '"+1"', '"(1"', '"1)"', '"1 2"', '"1(2)"', '"()"', '"1x"', '""']) {
    assert.throws(() => parseInput(bad), undefined, bad)
  }
})

test('1597 division by zero is reported without a value', () => {
  assert.equal(run('"4/(2-2)"').result, null)
})

test('1597 random expressions match the recursive-descent oracle', () => {
  let seed = 1597
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const ops = '+-*/'
  const atom = () => String(rnd(12))
  const gen = depth => {
    const parts = 1 + rnd(3)
    let out = ''
    for (let i = 0; i < parts; i++) {
      const piece = depth < 2 && rnd(3) === 0 ? `(${gen(depth + 1)})` : atom()
      out += (i ? ops[rnd(4)] : '') + piece
    }
    return out
  }
  for (let t = 0; t < 400; t++) {
    const text = gen(0)
    if (text.length > 21) continue
    const expected = oracle(text)
    const r = run(JSON.stringify(text))
    assert.equal(r.result, expected[1], text)
    const last = r.frames[r.frames.length - 1]
    assert.equal(serialize(last.nodes, r.root), expected[0], text)
  }
})

test('1597 frame invariants hold on every frame', () => {
  for (const text of ['"12+3*4"', '"(2+9)*(10-4)/3"', '"100/7/2"']) {
    const r = run(text)
    for (const f of r.frames) {
      assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= 12, f.phase)
      assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1, f.phase)
      const ids = new Set(f.nodes.map(n => n.id))
      assert.equal(ids.size, f.nodes.length)
      for (const id of f.operands) assert.ok(ids.has(id))
      for (const n of f.nodes) for (const k of [n.left, n.right]) if (k !== null) assert.ok(ids.has(k))
    }
  }
})
