import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = s => buildTrace({ s }).result
const pyLines = python.trim().split('\n')

test('3597 hand-computed cases', () => {
  assert.deepEqual(solve('xyxzxxyy'), ['x', 'y', 'xz', 'xx', 'yy'])
  assert.deepEqual(solve('qpqpq'), ['q', 'p', 'qp'])
  assert.deepEqual(solve('mmmmmm'), ['m', 'mm', 'mmm'])
  assert.deepEqual(solve('mmmm'), ['m', 'mm'])
})

test('3597 edge cases', () => {
  assert.deepEqual(solve('k'), ['k'])
  assert.deepEqual(solve('kk'), ['k'])
  assert.deepEqual(solve('walnut'), ['w', 'a', 'l', 'n', 'u', 't'])
})

test('3597 parseInput validates', () => {
  assert.doesNotThrow(() => parseInput('{"s":"abc"}'))
  assert.throws(() => parseInput('{"s":""}'))
  assert.throws(() => parseInput('{"s":"aB"}'))
  assert.throws(() => parseInput('{"s":12}'))
  assert.throws(() => parseInput(JSON.stringify({ s: 'a'.repeat(41) })))
})

// Oracle: the direct procedure with a set of strings.
function oracle(s) {
  const seen = new Set()
  const pieces = []
  let current = ''
  for (const c of s) {
    current += c
    if (!seen.has(current)) { seen.add(current); pieces.push(current); current = '' }
  }
  return pieces
}

test('3597 oracle on random strings', () => {
  let seed = 3597
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 500; t++) {
    const s = Array.from({ length: 1 + rnd(40) }, () => 'abc'[rnd(1 + rnd(3))]).join('')
    assert.deepEqual(solve(s), oracle(s), s)
  }
})

test('3597 frames map to executed lines, and trie and cuts stay consistent', () => {
  const expected = { start: 'start = 0', scan: 'for i, c', walk: 'node = node[c]', create: 'node[c] = {}', cut: /pieces\.append|start = i \+ 1/, done: 'return pieces' }
  const ids = new Set(phases.map(p => p.id))
  for (const s of ['xyxzxxyy', 'qpqpq', 'k']) {
    const { frames, result } = buildTrace({ s })
    for (const f of frames) {
      assert.ok(ids.has(f.phase))
      assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
      const line = pyLines[f.pythonLine - 1]
      const want = expected[f.phase]
      assert.ok(want instanceof RegExp ? want.test(line) : line.includes(want), `${f.phase} -> ${line}`)
      assert.ok(f.message && !f.message.includes('undefined'))
      // Each node other than the root spells a piece; pieces kept never overlap and stay in order.
      for (const node of f.nodes.slice(1)) assert.equal(f.nodes[node.parent].prefix + node.char, node.prefix)
      for (let i = 0; i < f.pieces.length; i++) assert.equal(s.slice(f.pieces[i].from, f.pieces[i].to + 1), f.pieces[i].text)
      assert.ok(f.nodes[f.activeNode])
    }
    const last = frames.at(-1)
    assert.deepEqual(last.pieces.map(p => p.text), result)
    assert.equal(last.nodes.length - 1, result.length)
    assert.equal(result.join('') + (last.tail?.text ?? ''), s)
  }
  assert.equal(buildTrace({ s: 'qpqpq' }).frames.at(-1).tail.text, 'q')
  assert.equal(buildTrace({ s: 'xyxzxxyy' }).frames.at(-1).tail, null)
  const created = buildTrace({ s: 'xy' }).frames.find(f => f.phase === 'create')
  assert.equal(created.nodes[created.newNode].role, 'created')
})
