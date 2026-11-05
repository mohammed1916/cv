import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = pairs => buildTrace(parseInput(JSON.stringify({ pairs }))).result
const PY = python.split('\n')

test('2822 worked examples', () => {
  assert.deepEqual(solve([['a', 'x'], ['b', 'y']]), { x: 'a', y: 'b' })
  assert.deepEqual(solve([['a', 1], ['b', 2], ['c', 1]]), { 1: ['a', 'c'], 2: 'b' })
})

test('2822 a value seen three times keeps all keys in order', () => {
  assert.deepEqual(solve([['p', 'v'], ['q', 'v'], ['r', 'v']]), { v: ['p', 'q', 'r'] })
})

test('2822 frames point at real python lines', () => {
  for (const f of buildTrace({ pairs: [['a', 1], ['b', 1], ['c', 1]] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2822 rejects duplicate keys', () => {
  assert.throws(() => parseInput('{"pairs":[["a",1],["a",2]]}'))
})

// Oracle: group keys by their value string, keeping the input order.
test('2822 random inputs match a grouping oracle', () => {
  let seed = 2822
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(8)
    const pairs = Array.from({ length: n }, (_, i) => [`k${i}`, rnd(3) === 0 ? String(rnd(3)) : rnd(3)])
    const groups = new Map()
    for (const [k, v] of pairs) groups.set(String(v), [...(groups.get(String(v)) ?? []), k])
    const expected = Object.fromEntries([...groups].map(([v, ks]) => [v, ks.length === 1 ? ks[0] : ks]))
    assert.deepEqual(solve(pairs), expected, JSON.stringify(pairs))
  }
})
