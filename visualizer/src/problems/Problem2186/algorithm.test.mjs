import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (s, t) => buildTrace(parseInput(JSON.stringify({ s, t }))).result

test('2186 worked examples', () => {
  assert.equal(solve('leetcode', 'coats'), 7)
  assert.equal(solve('night', 'thing'), 0)
  assert.equal(solve('a', 'b'), 2)
  assert.equal(solve('aab', 'b'), 2)
})

test('2186 rejects invalid input', () => {
  assert.throws(() => parseInput('{"s":"A","t":"a"}'))
  assert.throws(() => parseInput('{"s":"","t":"a"}'))
  assert.throws(() => parseInput('{"s":"abcdefghijklmnopq","t":"a"}'))
})

test('2186 random strings match a multiset difference', () => {
  let seed = 2186
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = () => Array.from({ length: 1 + rnd(8) }, () => 'abcd'[rnd(4)]).join('')
  for (let k = 0; k < 200; k++) {
    const s = word(); const t = word()
    const a = [...s].sort(); const b = [...t].sort()
    let shared = 0
    const bag = new Map()
    for (const ch of b) bag.set(ch, (bag.get(ch) || 0) + 1)
    for (const ch of a) if (bag.get(ch) > 0) { shared++; bag.set(ch, bag.get(ch) - 1) }
    assert.equal(solve(s, t), a.length + b.length - 2 * shared, `${s} ${t}`)
  }
})

test('2186 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"s":"leetcode","t":"coats"}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
