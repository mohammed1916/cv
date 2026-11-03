import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, inserts) => buildTrace({ n, inserts }).result

// Independent oracle: after each insertion, release every id from the next unreleased id while it is present.
function oracle(n, inserts) {
  const present = new Map()
  let next = 1
  return inserts.map(([id, value]) => {
    present.set(id, value)
    const chunk = []
    while (next <= n && present.has(next)) {
      chunk.push(present.get(next))
      next++
    }
    return chunk
  })
}

test('1656 hand-checked arrival orders', () => {
  assert.deepEqual(solve(5, [[3, 'c'], [1, 'a'], [2, 'b'], [5, 'e'], [4, 'd']]),
    [[], ['a'], ['b', 'c'], [], ['d', 'e']])
  assert.deepEqual(solve(3, [[1, 'x'], [2, 'y'], [3, 'z']]), [['x'], ['y'], ['z']])
  assert.deepEqual(solve(1, [[1, 'q']]), [['q']])
})

test('1656 random arrival orders match the oracle', () => {
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(12)
    const ids = Array.from({ length: n }, (_, i) => i + 1)
    for (let i = ids.length - 1; i > 0; i--) { const j = rnd(i + 1); [ids[i], ids[j]] = [ids[j], ids[i]] }
    const inserts = ids.map(id => [id, 'abcde'.slice(0, 1 + rnd(5))])
    assert.deepEqual(solve(n, inserts), oracle(n, inserts), JSON.stringify({ n, inserts }))
  }
})

test('1656 the first slot empty keeps every later value waiting', () => {
  const { frames, result } = buildTrace({ n: 4, inserts: [[4, 'd'], [3, 'c'], [2, 'b']] })
  assert.deepEqual(result, [[], [], []])
  assert.equal(frames.at(-1).phase, 'done')
})

test('1656 rejects invalid inserts', () => {
  assert.throws(() => parseInput('{"n":3,"inserts":[[4,"a"]]}'), /1 to 3/)
  assert.throws(() => parseInput('{"n":3,"inserts":[[1,"a"],[1,"b"]]}'), /more than once/)
  assert.throws(() => parseInput('{"n":3,"inserts":[[1,"A"]]}'), /lowercase/)
  assert.throws(() => parseInput('{"n":3,"inserts":[[1,"a"],[2,"b"],[3,"c"],[1,"d"]]}'), /at most n/)
})
